import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            // Redirect based on role
            navigate('/admin/dashboard'); // Default for now
        }
    };

    return (
        <div className="flex justify-center items-center h-screen" style={{ backgroundColor: 'var(--primary-50)' }}>
            <div className="card w-full" style={{ maxWidth: '400px' }}>
                <div className="flex justify-center mb-4">
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>P</span>
                    </div>
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-900)' }}>Pydah Academic Portal</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="label">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
