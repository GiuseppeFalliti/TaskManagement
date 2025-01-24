// src/App.jsx
import React, { useState } from 'react'; // Importa useState
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import MainPage from './pages/MainPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Usa useState

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/main" />
            ) : (
              <LoginPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/main" />
            ) : (
              <RegisterPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/main"
          element={
            isAuthenticated ? (
              <MainPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;