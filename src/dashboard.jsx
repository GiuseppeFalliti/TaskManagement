import React, { useState, useEffect } from 'react'; // Importiamo React e gli hook useState e useEffect
import { Box, Typography, IconButton } from '@mui/material';  // Importiamo i componenti di Material-UI
import { CircularProgressbar } from 'react-circular-progressbar'; // Importiamo CircularProgressbar per il grafico circolare
import 'react-circular-progressbar/dist/styles.css'; // Importiamo gli stili per CircularProgressbar
import MenuIcon from '@mui/icons-material/Menu'; 
import Tasks from './components/Tasks'; // Importiamo il componente Tasks
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // State per la vista attuale
  const [tasks, setTasks] = useState([]); // State per le task

  // Eseguiamo la chiamata all'API al montaggio del componente
  useEffect(() => {
    fetchTasks();
    fetchUser();
  }, []);

  // Funzione per ottenere le task
  const fetchTasks = async (e) => {
    try {
      const response = await axios.get(`${API_URL}/tasks`); // Chiamata all'API per ottenere le task
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // funzione per ottenere l'utente
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    
  }
  // Funzioni per ottenere le prime 3 task da visualizzare 
  const getTopTasks = () => {
    return tasks.slice(0, 3);
  };

  // Funzione per ottenere le task in progresso
  const getInProgressTasks = () => {
    return tasks
      .filter(task => task.progress > 0 && task.progress < 100) // Filtra solo le task in progresso tra 1 e 100
      .sort((a, b) => b.progress - a.progress) // Ordina per progresso decrescente
      .slice(0, 3);
  };

  // Funzione per renderizzare il contenuto in base alla vista attuale
  const renderContent = () => {
    if (currentView === 'tasks') {
      return <Tasks onTasksChange={fetchTasks} />;
    }
    

    return (
      <>
      {/* sezione visualizzazione grafico task utilizzando Material-UI */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: {
            xs: 2,
            sm: 3,
            md: 4
          },
          mb: {
            xs: 3,
            sm: 4,
            md: 5
          }
        }}>
          {getTopTasks().map((task) => (
            <Box 
              key={task._id} 
              sx={{ 
                bgcolor: '#222', 
                p: {
                  xs: 2,
                  sm: 3,
                  md: 4
                }, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box sx={{ 
                width: {
                  xs: 100,
                  sm: 110,
                  md: 120
                }, 
                mb: 2 
              }}>
                {/* progressbar utilizzando Material-UI */}
                <CircularProgressbar 
                  value={task.progress}
                  text={`${task.progress}%`}
                  styles={{
                    path: { stroke: task.color },
                    text: { 
                      fill: '#fff',
                      fontSize: '16px'
                    },
                    trail: { stroke: '#333' },
                  }}
                />
              </Box>
              <Typography 
                sx={{ 
                  textAlign: 'center',
                  fontSize: {
                    xs: 14,
                    sm: 15,
                    md: 16,
                    lg: 16,
                    xl: 18
                  }
                }}
              >
                {task.name}
              </Typography>
              <Typography 
                sx={{ 
                  textAlign: 'center',
                  fontSize: {
                    xs: 12,
                    sm: 13,
                    md: 14,
                    lg: 14,
                    xl: 16
                  },
                  color: '#666',
                  mt: 1
                }}
              >
                {task.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Tasks List */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            fontSize: {
              xs: 18,
              sm: 20,
              md: 22,
              lg: 24,
              xl: 26
            }
          }}
        >
          In Progress Tasks
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: {
            xs: 2,
            sm: 2.5,
            md: 3
          }
        }}>
          {getInProgressTasks().map((task) => (
            <Box 
              key={task._id} 
              sx={{ 
                bgcolor: '#222', 
                p: {
                  xs: 2,
                  sm: 2.5,
                  md: 3
                }, 
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: {
                  xs: 'column',
                  sm: 'row'
                },
                gap: {
                  xs: 2,
                  sm: 0
                }
              }}
            >
              <Box sx={{ 
                width: {
                  xs: '100%',
                  sm: '30%'
                }
              }}>
                <Typography 
                  sx={{
                    fontSize: {
                      xs: 14,
                      sm: 15,
                      md: 16,
                      lg: 16,
                      xl: 18
                    }
                  }}
                >
                  {task.name}
                </Typography>
                <Typography 
                  sx={{
                    fontSize: {
                      xs: 12,
                      sm: 13,
                      md: 14,
                      lg: 14,
                      xl: 16
                    },
                    color: '#666'
                  }}
                >
                  {task.description}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#666',
                    fontSize: {
                      xs: 11,
                      sm: 12,
                      md: 13,
                      lg: 13,
                      xl: 14
                    }
                  }}
                >
                  {task.category}
                </Typography>
              </Box>
              <Box sx={{ 
                width: {
                  xs: '100%',
                  sm: '60%'
                }, 
                height: 8, 
                bgcolor: '#333',
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  width: `${task.progress}%`,
                  height: '100%',
                  bgcolor: task.color,
                  borderRadius: 4
                }} />
              </Box>
              <Typography 
                sx={{
                  fontSize: {
                    xs: 14,
                    sm: 15,
                    md: 16,
                    lg: 16,
                    xl: 18
                  }
                }}
              >
                {task.progress}%
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    );
  };


  return (
    <Box sx={{ display: 'flex', bgcolor: '#1a1a1a', color: 'white', minHeight: '100vh'}}>
      {/* Sidebar */}
      <Box sx={{ 
        width: {
          xs: 200,
          sm: 220,
          md: 240,
          lg: 260,
          xl: 280
        }, 
        borderRight: '1px solid #333', 
        p: {
          xs: 2,
          sm: 2.5,
          md: 3
        },  
      }}>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: {
            xs: 3,
            sm: 4,
            md: 5
          } 
        }}>
          <IconButton color="inherit">
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              ml: 1,
              fontSize: {
                xs: 18,
                sm: 20,
                md: 22,
                lg: 24,
                xl: 26
              }
            }}
          >
            Task Dasher
          </Typography>
        </Box>
        

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: {
            xs: 1.5,
            sm: 2,
            md: 2.5
          } 
        }}>
          <Typography 
            sx={{ 
              p: {
                xs: 1,
                sm: 1.5,
                md: 2
              }, 
              borderRadius: 1, 
              cursor: 'pointer',
              bgcolor: currentView === 'tasks' ? '#333' : 'transparent',
              '&:hover': { bgcolor: '#333' },
              fontSize: {
                xs: 14,
                sm: 15,
                md: 16,
                lg: 16,
                xl: 18
              }
            }}
            onClick={() => setCurrentView('tasks')}
          >
            All Tasks
          </Typography>
          <Typography 
            sx={{ 
              p: {
                xs: 1,
                sm: 1.5,
                md: 2
              }, 
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: currentView === 'dashboard' ? '#333' : 'transparent',
              '&:hover': { bgcolor: '#333' },
              fontSize: {
                xs: 14,
                sm: 15,
                md: 16,
                lg: 16,
                xl: 18
              }
            }}
            onClick={() => {
              setCurrentView('dashboard');
              fetchTasks();
            }}
          >
            Dashboard
          </Typography>
          </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        p: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: {
            xs: 3,
            sm: 4,
            md: 5
          }
        }}>
          <Typography 
            variant="h5"
            sx={{
              fontSize: {
                xs: 24,
                sm: 28,
                md: 32,
                lg: 36,
                xl: 40
              },
              fontWeight: 'bold'
            }}
          >
            {currentView === 'dashboard' ? 'Dashboard' : 'All Tasks'}
          </Typography>
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;