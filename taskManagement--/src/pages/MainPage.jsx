import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../mainPage.css';

const MainPage = () => {
  const [tasks, setTasks] = useState([]); // array che contiene tutte le task
  const [showModal, setShowModal] = useState(false); //booleano che controlla la visibilità di una finestra
  const [editingTask, setEditingTask] = useState(null); //contiene il task attualmente in fase di modifica (null se non si sta modificando nessun task)
  const [taskForm, setTaskForm] = useState({ //ggetto che contiene i dati del form per un task.
    title: '',
    description: '',
    dueDate: '',
    status: 'todo' // todo, inProgress, completed
  });

  // Carica le task dell'utente all'avvio del componente
  useEffect(() => {
    getTasks();
  }, []);

  // Funzione per ottenere le task dell'utente
  const getTasks = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://localhost:3000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Errore nel caricamento delle task:', error);
      }
    }
  };

  // Funzione per aggiungere o modificare un task
  const TaskManage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (taskForm.title.trim()) {
      try {
        if (editingTask) {
          // Modifica task esistente
          await axios.put(`http://localhost:3000/api/tasks/${editingTask.id}`, taskForm, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Creazione di una nuova task
          await axios.post('http://localhost:3000/api/tasks', taskForm, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        // Ricarica le task dopo la modifica
        getTasks();
        // Resetta il form
        setTaskForm({
          title: '',
          description: '',
          dueDate: '',
          status: 'todo'
        });
        setShowModal(false);
        setEditingTask(null);
      } catch (error) {
        console.error('Errore nella gestione della task:', error);
      }
    }
  };

  // Funzione per eliminare un task
  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getTasks(); // Ricarica le task dopo l'eliminazione
    } catch (error) {
      console.error('Errore nell\'eliminazione della task:', error);
    }
  };

  // Funzione per aprire il modal di modifica
  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      status: task.status
    });
    setShowModal(true);
  };

  return (
    //header
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="title-logo">
          <h1>Gestione Task</h1>
          <img src="./src/assets/logo.png" alt="logos" />
        </div>
        
        <div className="user-info">
          <span className="user-avatar" >👤</span>
        </div>
      </header>


      <div className="task-container">
        <div className="task-controls">
          <button onClick={() => setShowModal(true)} className="add-button">
            <span>Nuova Task</span>
          </button>
        </div>

        {/* Modal per aggiungere/modificare task */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingTask ? 'Modifica Task' : 'Nuova Task'}</h2>
              {/* form per aggiungere/modificare task */}
              <form onSubmit={TaskManage}>
                <div className="form-group">
                  <label>Titolo</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="Titolo della task"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descrizione</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="Descrizione della task"
                  />
                </div>
                <div className="form-group">
                  <label>Data di scadenza</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Stato</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                  >
                    <option value="todo">Da fare</option>
                    <option value="inProgress">In corso</option>
                    <option value="completed">Completato</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-button">
                    {editingTask ? 'Salva Modifiche' : 'Crea Task'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      setEditingTask(null);
                      setTaskForm({
                        title: '',
                        description: '',
                        dueDate: '',
                        status: 'todo'
                      });
                    }}
                    className="cancel-button"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista dei task */}
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="no-tasks">
              <p>Non ci sono task da mostrare</p>
              <p className="subtitle">Aggiungi una nuova task per iniziare</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    {task.dueDate && (
                      <span className="due-date">
                        Scadenza: {new Date(task.dueDate).toLocaleDateString('it-IT')}
                      </span>
                    )}
                    <span className={`status-badge ${task.status}`}>
                      {task.status === 'todo' && 'Da fare'}
                      {task.status === 'inProgress' && 'In corso'}
                      {task.status === 'completed' && 'Completato'}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button 
                    onClick={() => editTask(task)}
                    className="edit-button"
                  >
                    📝
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="delete-button"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;