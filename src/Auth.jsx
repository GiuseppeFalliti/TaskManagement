import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Link,
    Paper,
    createTheme,
    ThemeProvider,
} from '@mui/material';
import axios from 'axios';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const API_URL = 'http://localhost:3001/api';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                name,
                password,
                marketingConsent
            });
            localStorage.setItem('userId', response.data.id);
            navigate('/dashboard');
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        maxWidth: 400,
                        width: '100%'
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        Sign up
                    </Typography>

                    <Box component="form" sx={{ mt: 3 }}>


                        <TextField
                            label="Email"
                            variant="filled"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            sx={{
                                width: '335px',
                                color: 'white',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '15px',
                                    '& fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-disabled fieldset': {
                                        borderColor: 'white !important',
                                    },
                                    '& input::placeholder': {
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                    fontSize: 16
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                    fontSize: 16,
                                    '&::placeholder': {
                                        color: 'white',
                                        opacity: 1,
                                    },
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'white',
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Name"
                            variant="filled"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="filled"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    By creating an account, I agree to this website's{' '}
                                    <Link href="#" underline="hover">privacy policy</Link> and{' '}
                                    <Link href="#" underline="hover">terms of service</Link>
                                </Typography>
                            }
                            sx={{ mt: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={marketingConsent}
                                    onChange={(e) => setMarketingConsent(e.target.checked)}
                                />
                            }
                            label="I consent to receive marketing emails."
                            sx={{ mt: 1 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSignUp}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Sign Up
                        </Button>


                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" display="inline">
                                Already have an account?{' '}
                            </Typography>
                            <Link
                                href="#"
                                onClick={() => navigate('/signin')}
                                underline="hover"
                            >
                                Log In
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default Auth;