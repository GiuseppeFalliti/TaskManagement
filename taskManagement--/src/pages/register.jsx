import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../auth.css';

const Register = ({ setIsAuthenticated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Prima registra l'utente
      const registerResponse = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.text();
        throw new Error(data);
      }

      // Dopo la registrazione, effettua automaticamente il login
      const loginResponse = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error('Errore durante il login automatico');
      }

      const { token } = await loginResponse.json();
      
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
      <h1>Registrazione</h1>
      <form onSubmit={handleSubmit} className='form'>
        {error && <div className="error-message">{error}</div>}

        <div className='name-container'>
          <input 
            type="text" 
            className='input' 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder='Nome' 
            required
          />
        </div>

        <div className='email-container'>
          <input 
            type="email" 
            className='input' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder='Email' 
            required
          />
        </div>

        <div className='password-container'>
          <input 
            type="password" 
            className='input' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder='Password' 
            required
          />
        </div>

        <button className='button' type="submit">Registrati</button>
      </form>
      <p className='link-container'>
        Hai già un account? <Link to="/login" className='link'>Accedi</Link>
      </p>
    </div>
  );
};

export default Register;