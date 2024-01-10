import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './LoginForm.css'
import {jwtDecode} from "jwt-decode";

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [admins, setAdmins] = useState([]);
    const navigate = useNavigate();  // Hook to get history object

    useEffect(() => {
        handleAdmins();
    }, []);

    const handleAdmins = async () => {
        try {
            const response = await fetch("/api/users/admins", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setAdmins(data.map(admin => admin.nickname));

        } catch (error) {
            console.error("Failed to get Admins: ", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage('');

        const loginDetails = {
            email,
            password
        };



        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDetails),
            });

            const data = await response.json();
            if (response.ok) {
                if (data.status == "PENDING"){
                    localStorage.setItem('authToken', data.authToken);
                    navigate('/profile-pending')
                } else if (data.status == "BLOCKED"){
                    //localStorage.setItem('authToken', data.authToken); TODO protect all routes
                    navigate('/profile-blocked')
                }
                else {
                    localStorage.setItem('authToken', data.authToken);
                    console.log("DODAN TOKEN")
                    const decodedToken = jwtDecode(data.authToken);
                    // Determine the navigation path based on whether the user is an admin
                    const isAdmin = admins.includes(decodedToken.nickname);
                    const path = isAdmin ? '/admin-home' : '/home';
                    navigate(path);
                    window.location.reload() //only used for showing nickname under the account logo
                }
            } else {
                setErrorMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Login failed. Please try again.');
        }
    };




    return (
        <div className="login-form-container">
            <h2 className="login-form-title">Prijava</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-form-button">Prijava</button>
            </form>
            <p className="register-link">
                Nemate račun? <span onClick={() => navigate('/register')}>Registrirajte se.</span>
            </p>
        </div>
    );
}

export default LoginForm;