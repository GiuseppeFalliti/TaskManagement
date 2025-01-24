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
    password TEXT
)`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
        process.exit(1);
    }
    console.log("Table 'users' created");
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
        const { id, name } = row;
        const token = jwt.sign({ id, name, email }, "secret", { expiresIn: "1h" });
        return res.status(200).json({ token });
    });
});

// Avvia il server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});