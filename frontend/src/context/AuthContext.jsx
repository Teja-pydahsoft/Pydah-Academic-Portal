import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token if needed or just restore user from localstorage
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                    // Optionally verify with backend
                    const response = await api.get('/auth/verify');
                    if (response.data.success) {
                        setUser(response.data.user);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                } catch (error) {
                    console.error('Auth verification failed', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                toast.success(`Welcome back, ${user.name || user.username}!`);
                return true;
            }
        } catch (error) {
            console.error('Login error', error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const hasPermission = (module, permission) => {
        // Basic permission check - expand based on real RBAC logic if needed
        // For now assuming if you have the role you assume you have basic permissions
        // This should be more granular in a real app
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasRole, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};
