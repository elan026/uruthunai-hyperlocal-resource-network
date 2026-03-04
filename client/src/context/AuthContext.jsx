import { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [emergencyMode, setEmergencyMode] = useState(false);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        setUser(null);
    };

    const value = {
        user,
        setUser,
        login,
        logout,
        emergencyMode,
        setEmergencyMode
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
