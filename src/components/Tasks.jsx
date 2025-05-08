import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,  
  Button, 
  TextField,  
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios'; //importo axios per fare le chiamate all'API

const API_URL = 'http://localhost:3001/api'; //API URL

const Tasks = () => {
  //utilizzo dell'hook useState per avere contenitori reattivi.
  const [tasks, setTasks] = useState([]); //utilizzo dell'hook useState per gestire lo stato delle task. inizializzo lo stato con un array vuoto.
  const [open, setOpen] = useState(false); //utilizzo dell'hook useState per gestire lo stato dell'apertura del dialogo per l'aggiunta di una task.
  const [editingTask, setEditingTask] = useState(null);// Stato per tracciare se stiamo modificando una task esistente

  //gestisce lo stato di uno Snackbar, un componente di Material-UI che mostra messaggi di feedback temporanei.
  const [snackbar, setSnackbar] = useState({
    open: false, //nascosto inizialmente
    message: '', //messaggio da mostrare
    severity: 'success' //tipo di messaggio, success, error, warning, info
  });

  //stato per la creazione o l'aggiornamento di una task
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    description: '',
    progress: 0,
    color: '#3366ff'
  });

  //categorie possibili per le task
  const categories = ['compito', 'lavorativo', 'personale', 'studio', 'hobby', 'famiglia', 'salute','finanza'];
  const colors = ['#ff9999', '#3366ff', '#ffcc66', '#66cc99', '#ff66cc', '#9966cc', '#66ccff', '#ff6666', '#99cc66', '#cc9966'];

  

  //funzione Fetch per ottenere le task facendo la chiamata all'API
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      OpenSnackbar('Errore nel caricamento delle task', 'error');
    }
  };

  //hook useEffect per caricare le task al montaggio del componente.
  useEffect(() => {
    fetchTasks();
  }, []);

  //funzione per aprire il dialogo per creare/modificare una task
  const taskDialog = (task = null) => {

    if (task) { // Se task viene passato(true), significa che stiamo modificando una task esistente
      setNewTask(task);
      setEditingTask(task.id);
    }
    //se task non viene passato(false), significa che stiamo creando una nuova task
    setOpen(true);
  };
  

  //funzione per chiudere il dialogo
  const handleClose = () => {
    setOpen(false);
    setNewTask({  // Resetta il form della nuova task
      name: '',
      category: '', 
      description: '',
      progress: 0,
      color: '#3366ff'
    });
    setEditingTask(null);  // Reset editing state
  };

  //funzione per mostrare un Snackbar cioe il messaggio di feedback temporaneo.
  const OpenSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  //funzione per chiudere il Snackbar.
  const SnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  //gestisce i cambiamenti nei campi di input del form per la creazione/modifica di una task
  //dove gli passiamo e(listener di react per l'input).
  const inputChange = (e) => {
    const { name, value } = e.target; //target estrae i dati del form
    setNewTask(prevTask => {
      // Creiamo una copia dell'oggetto precedente
      const updatedTask = { ...prevTask };
      
      // Se il campo è 'progress', convertiamo il valore in numero
      // altrimenti manteniamo il valore come stringa
      updatedTask[name] = name === 'progress' ? Number(value) : value;
      
      return updatedTask;
    });
  };
  

  //funzione per validare i dati del form.
  const validateTask = () => {
    if (!newTask.name.trim()) {
      OpenSnackbar('Il nome della task è obbligatorio', 'error');
      return false;
    }
    if (!newTask.description.trim()) {
      OpenSnackbar('La descrizione è obbligatoria', 'error');
      return false;
    }
    if (!newTask.category) {
      OpenSnackbar('La categoria è obbligatoria', 'error');
      return false;
    }
    if (newTask.progress < 0 || newTask.progress > 100) {
      OpenSnackbar('Il progresso deve essere tra 0 e 100', 'error');
      return false;
    }
    return true;
  };

  //funzione per creare una task e fare la chiamata all'API per aggiungerla alle task.
  const addEditTask = async () => {
    if (!validateTask()) return;

    try {
      // Creiamo una copia pulita dell'oggetto task
      const taskToSend = {
        name: newTask.name,
        description: newTask.description,
        category: newTask.category,
        progress: newTask.progress || 0,
        color: newTask.color || '#3366ff'
      };

      console.log('invio dati task :', JSON.stringify(taskToSend));

      // Creazione o update task
      if (editingTask) {
        // Update task esistente
        const response = await axios.put(`${API_URL}/tasks/${editingTask}`, taskToSend);
        setTasks(prev => prev.map(task => task.id === editingTask ? response.data : task));
        OpenSnackbar('Task aggiornata con successo');
      } else {
        // Creazione task
        const response = await axios.post(`${API_URL}/tasks`, taskToSend);
        setTasks(prev => [...prev, response.data]);
        OpenSnackbar('Task creata con successo');
      }
      handleClose(); // Chiudi la finestra di dialogo
    } catch (error) {
      console.error('Error saving task:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      OpenSnackbar(`Errore nel ${editingTask ? 'aggiornamento' : 'creazione'} della task`, 'error');
    }
  };

  //funzione per eliminare una task e fare la chiamata all'API per eliminare la task.
  const DeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      // Filtra l'array delle task rimuovendo quella con l'ID specificato
      setTasks(prevTasks => {
        // Crea un nuovo array escludendo la task da eliminare
        const tasksAfterDelete = prevTasks.filter(task => {
          return task.id !== id; // Mantiene solo le task con ID diverso da quello da eliminare
        });
        return tasksAfterDelete;
      });
      OpenSnackbar('Task eliminata con successo');
    } catch (error) {
      console.error('Error deleting task:', error);
      OpenSnackbar('Errore nell eliminazione della task', 'error');
    }
  };

  return (
    <Box sx={{
      width: '100%',
      p: {
        xs: 2,
        sm: 3,
        md: 4,
        lg: 5,
        xl: 6
      },
    }}>
      {/* Header con titolo e pulsante aggiungi */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: {
          xs: 2,
          sm: 3,
          md: 4
        }
      }}>
        <Typography sx={{
          fontSize: {
            xs: 24,
            sm: 28,
            md: 32,
            lg: 36,
            xl: 40
          },
          fontWeight: 'bold'
        }}>
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => taskDialog()}
          sx={{
            bgcolor: '#222',
            color: 'white',
            borderRadius: 2,
            textTransform: 'none',
            px: {
              xs: 2,
              sm: 3,
              md: 4
            },
            py: {
              xs: 1,
              sm: 1.5,
              md: 2
            },
            fontSize: {
              xs: 14,
              sm: 15,
              md: 16,
              lg: 16,
              xl: 18
            },
            '&:hover': {
              bgcolor: 'white',
              color: '#222'
            }
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Lista delle task */}
      <Box sx={{
        display: 'grid',
        gap: {
          xs: 2,
          sm: 3,
          md: 4
        },
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)'
        }
      }}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              bgcolor: '#222',
              borderRadius: 2,
              p: {
                xs: 2,
                sm: 3,
                md: 4
              },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography sx={{
                fontSize: {
                  xs: 16,
                  sm: 18,
                  md: 20,
                  lg: 22,
                  xl: 24
                },
                fontWeight: 'bold'
              }}>
                {task.name}
              </Typography>
              <Box>
                <IconButton
                  onClick={() => taskDialog(task)}
                  sx={{ color: 'white' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => DeleteTask(task.id)}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography sx={{
              fontSize: {
                xs: 14,
                sm: 15,
                md: 16,
                lg: 16,
                xl: 18
              }
            }}>
              {task.description}
            </Typography>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto'
            }}>
              <Typography
                sx={{
                  bgcolor: task.color,
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: {
                    xs: 12,
                    sm: 13,
                    md: 14,
                    lg: 14,
                    xl: 16
                  }
                }}
              >
                {task.category}
              </Typography>
              <Typography sx={{
                fontSize: {
                  xs: 14,
                  sm: 15,
                  md: 16,
                  lg: 16,
                  xl: 18
                }
              }}>
                {task.progress}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Dialog per aggiungere/modificare task */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: {
            xs: 20,
            sm: 22,
            md: 24,
            lg: 26,
            xl: 28
          }
        }}>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: {
              xs: 2,
              sm: 3,
              md: 4
            },
            mt: 2
          }}>
            <TextField
              label="Task Name"
              name="name"
              value={newTask.name}
              onChange={inputChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />

            <TextField
              label="Description"
              name="description"
              value={newTask.description}
              onChange={inputChange}
              multiline
              rows={4}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
              <Select
                name="category"
                value={newTask.category}
                onChange={inputChange}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  borderRadius: '15px',
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Progress"
              name="progress"
              type="number"
              value={newTask.progress}
              onChange={inputChange}
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>Color</InputLabel>
              <Select
                name="color"
                value={newTask.color}
                onChange={inputChange}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  borderRadius: '15px',
                }}
              >
                {colors.map((color) => (
                  <MenuItem
                    key={color}
                    value={color}
                    sx={{
                      bgcolor: color,
                      color: 'white',
                      '&:hover': {
                        bgcolor: color,
                      },
                    }}
                  >
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={addEditTask}
            variant="contained"
            sx={{
              bgcolor: '#222',
              color: 'white',
              '&:hover': {
                bgcolor: 'white',
                color: '#222',
              },
            }}
          >
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar per i messaggi di feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={SnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={SnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tasks;
