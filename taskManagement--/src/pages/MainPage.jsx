import React, { useState } from 'react';
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

  // Funzione per aggiungere o modificare un task
  const TaskManage = (e) => {
    e.preventDefault(); // previene l'invio del form
    if (taskForm.title.trim()) {
      if (editingTask) {
        // Modifica task esistente
        setTasks(tasks.map(task =>
          task.id === editingTask.id ? { ...task, ...taskForm } : task
         ));
      } else {
        //  creazione di una nuova task
        setTasks([...tasks, {
          id: Date.now(), 
          ...taskForm,
          createdAt: new Date().toISOString()
        }]);
      }
      // chiude la finestra di modifica
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        status: 'todo'
      });
      setShowModal(false);
      setEditingTask(null);
    }
  };

  // Funzione per aprire il modal di modifica
  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status
    });
    setShowModal(true);
  };

  // Funzione per eliminare un task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    //header
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Gestione Task</h1>
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