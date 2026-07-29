import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_TOKEN_KEY = 'alzheimers_auth_token';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem(AUTH_TOKEN_KEY);
        } catch (error) {
            return null;
        }
    });

    const isAuthenticated = useMemo(() => Boolean(token), [token]);

    useEffect(() => {
        if (!token) {
            try {
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (error) {
                // ignore localStorage errors
            }
        }
    }, [token]);

    const login = (newToken) => {
        try {
            localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        } catch (error) {
            console.warn('Unable to write auth token to localStorage', error);
        }
        setToken(newToken);
    };

    const logout = () => {
        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        } catch (error) {
            console.warn('Unable to remove auth token from localStorage', error);
        }
        setToken(null);
    };

    return ( <
        AuthContext.Provider value = {
            { token, isAuthenticated, login, logout } } > { children } <
        /AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export { AUTH_TOKEN_KEY };