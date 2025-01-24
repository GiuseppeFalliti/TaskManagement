import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../auth.css';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.text();
        throw new Error(data);
      }

      const { token } = await response.json();
      
      // Salva il token nel localStorage
      localStorage.setItem('token', token);
      
      // Imposta l'autenticazione a true
      setIsAuthenticated(true);
      
      // Reindirizza alla dashboard
      navigate('/MainPage');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='container'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className='email-container'>
          <input 
            className='input' 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder='Email' 
            required
          />
        </div>

        <div className='password-container'>
          <input 
            className='input' 
            type="password" 
            value={password}  
            onChange={(e) => setPassword(e.target.value)} 
            placeholder='Password' 
            required
          />
        </div>

        <button className='button' type="submit">Accedi</button>
      </form>
      <p className='link-container'>
        Non hai un account? <Link to="/register" className='link'>Registrati</Link>
      </p>
    </div>
  );
};

export default Login;