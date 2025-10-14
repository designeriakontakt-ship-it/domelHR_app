import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';
 // Upewnij się, że ten adres jest poprawny

// Definiujemy, co nasz Context będzie przechowywał
interface AuthContextType {
    authToken: string | null;
    userRole: 'employee' | 'employer' | null;
    login: (email, password) => Promise<void>;
    logout: () => void;
}

// Tworzymy Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tworzymy "Dostawcę" (Provider), który będzie zarządzał logiką
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'employee' | 'employer' | null>(null);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            
            if (response.ok) {
                // POPRAWIONA LOGIKA:
                // Zapisujemy zarówno token, jak i rolę otrzymaną z serwera
                setAuthToken(data.token);
                setUserRole(data.role); 
            } else {
                Alert.alert('Błąd logowania', data.error || 'Wystąpił nieznany błąd.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Tworzymy własny "hak" (hook), aby łatwo używać Contextu
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};