import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express(); // Inizializza l'applicazione
app.use(cors()); // Usa cors per gestire le cors
app.use(bodyParser.json()); // Usa bodyParser.json() per parsare i dati in JSON
app.use(bodyParser.urlencoded({ extended: true })); // Usa bodyParser.urlencoded() per parsare i dati in URL-encoded

// Connessione al database
const db = new sqlite3.Database("tasks.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    console.log("Connected to database");
});

//creazione tabella utenti
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
)`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
        process.exit(1);
    }
    console.log("Table 'users' created");
});

//creazione tabella task
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'todo',
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
        process.exit(1);
    }
    console.log("Table 'tasks' created");
});

//stampa degli utenti presenti nel database
db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
        console.error("Error retrieving users:", err.message);
        process.exit(1);
    }
    console.log("Users:", rows);
});

//Endpoint per la registrazione
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Verifica se l'email esiste già
    db.get("SELECT email FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).send("Errore durante la registrazione");
        }

        if (row) {
            return res.status(400).send("Email già registrata");
        }

        // Se l'email non esiste, procedi con la registrazione
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, password], (err) => {
                if (err) {
                    console.error("Error registering user:", err.message);
                    return res.status(500).send("Errore durante la registrazione");
                }
                res.status(200).send("Utente registrato con successo");
            });
    });
});

//Endpoint per login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) {
            console.error("Error logging in:", err.message);
            return res.status(500).send("Errore durante il login");
        }
        if (!row) {
            return res.status(401).send("Email o password non validi");
        }
        // Genera il token includendo l'id dell'utente
        const token = jwt.sign({ userId: row.id }, 'your-secret-key', { expiresIn: '24h' });
        res.json({ token });
    });
});

// Middleware per verificare il token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Token non fornito');
    }

    try {
        // Usa la chiave segreta per verificare il token
        const decoded = jwt.verify(token, 'your-secret-key'); 
        req.userId = decoded.userId; // Salva l'id dell'utente nel request
        next(); // Passa al prossimo middleware
    } catch (err) {
        return res.status(401).send('Token non valido');
    }
};

// Endpoint per ottenere le task dell'utente
app.get('/api/tasks', verifyToken, (req, res) => {
    const userId = req.userId;
    db.all("SELECT * FROM tasks WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            console.error("Error retrieving tasks:", err.message);
            return res.status(500).send("Errore nel recupero delle task");
        }
        res.json(rows);
    });
});

// Endpoint per creare una nuova task
app.post('/api/tasks', verifyToken, (req, res) => {
    const { title, description, dueDate, status } = req.body;
    const userId = req.userId;
    
    db.run(
        "INSERT INTO tasks (title, description, due_date, status, user_id) VALUES (?, ?, ?, ?, ?)",
        [title, description, dueDate, status, userId],
        function(err) {
            if (err) {
                console.error("Error creating task:", err.message);
                return res.status(500).send("Errore nella creazione della task");
            }
            
            // Restituisce la task appena creata con il suo ID
            db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
                if (err) {
                    console.error("Error retrieving created task:", err.message);
                    return res.status(500).send("Errore nel recupero della task creata");
                }
                res.status(201).json(row);
            });
        }
    );
});

// Endpoint per aggiornare una task
app.put('/api/tasks/:id', verifyToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.userId;
    const { title, description, dueDate, status } = req.body;

    db.run(
        "UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?",
        [title, description, dueDate, status, taskId, userId],
        (err) => {
            if (err) {
                console.error("Error updating task:", err.message);
                return res.status(500).send("Errore nell'aggiornamento della task");
            }
            res.json({ message: "Task aggiornata con successo" });
        }
    );
});

// Endpoint per eliminare una task
app.delete('/api/tasks/:id', verifyToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.userId;

    db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId], (err) => {
        if (err) {
            console.error("Error deleting task:", err.message);
            return res.status(500).send("Errore nell'eliminazione della task");
        }
        res.json({ message: "Task eliminata con successo" });
    });
});

// Avvia il server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});