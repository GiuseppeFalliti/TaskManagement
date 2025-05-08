import express from 'express'; // Importa Express per creare il server
import sqlite3 from 'sqlite3'; // Importa SQLite3 per gestire il database SQLite
import cors from 'cors'; // Importa CORS per gestire le richieste cross-origin
import path from 'path'; // Importa il modulo path per gestire i percorsi dei file
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inizializza Express
const app = express();

// Middlewarew
app.use(cors());
app.use(express.json());

// Configurazione Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('errre di connessione al database:', err);
    return;
  }
  console.log('Connesso a  SQLite database');

  // Creazione della tabella users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      id_task INTEGER,
      FOREIGN KEY (id_task) REFERENCES tasks (id)
    )
  `, (err) => {
    if (err) {
      console.error('Errore di creazione della tabella:', err);
      return;
    }
    console.log('Tabella degli utenti pronta');
  });

   
    // Crea la tabella tasks
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        color TEXT DEFAULT '#3366ff',
        id_user INTEGER,
        FOREIGN KEY (id_user) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('Errore di creazione della tabella:', err);
        return;
      }
      console.log('Tabella delle attività pronta');
    });
  });

//Endpoint per ottenere un utente
app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;

  db.all('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Errore nel recupero delle task:', err);
      return res.status(500).json({ message: 'Errore nel recupero delle task' });
    }
    res.json(rows);
  });


})  

// Endpoint per registrare un nuovo utente
app.post('/api/users', (req, res)=> {
  const { name, email, password, id_task } = req.body;
  const sql = `INSERT INTO users (name, surname, email, password, id_task) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [name, email, password, id_task], function(err) {
    if (err) {
      console.error('Errore durante l\'inserimento dell\'utente:', err);
      return res.status(500).json({ message: 'Errore durante l inserimento dell\'utente' });
    }
    res.json({ message: 'Utente creato con successo', id: this.lastID });
  });
});

//Endpoint per login utente
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.error('Errore durante il login dell\'utente:', err);
      return res.status(500).json({ message: 'Errore durante il login dell utente' });
    }
    if (row) {
      res.json({ message: 'Login effettuato con successo', id: row.id });
    } else {
      res.status(401).json({ message: 'Credenziali di accesso non valide' });
    }
  });
});


// ottieni tutte le task
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      console.error('Errore nel recupero delle task:', err);
      return res.status(500).json({ message: 'Errore nel recupero delle task' });
    }
    res.json(rows);
  });
});

//Endpoint per creare una task
app.post('/api/tasks', (req, res) => {
  const { name, category, description, progress = 0, color = '#3366ff' } = req.body;
  
  if (!name || !category || !description) {
    return res.status(400).json({ 
      message: 'Errore di validazione',
      errors: ['Nome, categoria e descrizione sono obbligatori']
    });
  }

  const sql = `INSERT INTO tasks (name, category, description, progress, color) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [name, category, description, progress, color], function(err) {
    if (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ message: 'Errore nella creazione della task', error: err.message });
    }

    // Recupera la task appena creata
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Task creata ma errore nel recupero:', err);
        return res.status(500).json({ message: 'Task creata ma errore nel recupero' });
      }
      res.status(201).json(row);
    });
  });
});

//endpoint per aggiornare una task
app.put('/api/tasks/:id', (req, res) => {
  const { name, category, progress, color } = req.body;
  const { id } = req.params; 

  // Prima verifica se la task esiste
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Errore nel controllo della task:', err);
      return res.status(500).json({ message: 'Errore nel controllo della task' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Task non trovata' });
    }

    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    
    values.push(id);

    // Aggiorna la task
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        console.error('Errore nell aggiornamento della task:', err);
        return res.status(500).json({ message: 'Errore nell aggiornamento della task' });
      }

      // Recupera la task aggiornata
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Errore nell aggiornamento della task:', err);
          return res.status(500).json({ message: 'Task aggiornata ma errore nel recupero' });
        }
        res.json(row);
      });
    });
  });
});

// delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  // Prima verifica se la task esiste
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error checking task:', err);
      return res.status(500).json({ message: 'Errore nel controllo della task' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Task non trovata' });
    }

    // Elimina la task
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ message: 'Errore nell\'eliminazione della task' });
      }
      res.json({ message: 'Task eliminata con successo', id });
    });
  });
});

// Gestione della chiusura del database
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

// Avvia il server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
  console.log(`Database location: ${dbPath}`);
});