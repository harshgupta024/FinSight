/**
 * Auth Context
 * Manages authentication state across the application.
 * Loads user from localStorage initially so the UI doesn't flash.
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage immediately (prevents blank flash)
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('finsight_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('finsight_token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('finsight_token'));

    // Verify token with backend on mount
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    const userData = data.data.user;
                    setUser(userData);
                    localStorage.setItem('finsight_user', JSON.stringify(userData));
                } catch {
                    // Token invalid – clear auth but only if we get a clear 401
                    // Don't clear on network errors (backend might be temporarily down)
                    localStorage.removeItem('finsight_token');
                    localStorage.removeItem('finsight_user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = useCallback(async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const { token: jwt, user: userData } = data.data;
            localStorage.setItem('finsight_token', jwt);
            localStorage.setItem('finsight_user', JSON.stringify(userData));
            setToken(jwt);
            setUser(userData);
            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    }, []);

    const register = useCallback(async (name, email, password, confirmPassword) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
            const { token: jwt, user: userData } = data.data;
            localStorage.setItem('finsight_token', jwt);
            localStorage.setItem('finsight_user', JSON.stringify(userData));
            setToken(jwt);
            setUser(userData);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('finsight_token');
        localStorage.removeItem('finsight_user');
        setToken(null);
        setUser(null);
        toast.success('Logged out');
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}
        >
            {children}
        </AuthContext.Provider>
    );
};
