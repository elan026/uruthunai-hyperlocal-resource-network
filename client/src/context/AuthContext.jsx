import { createContext, useContext, useState, useEffect } from 'react';
import { authService, systemService } from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);
const socket = io('http://localhost:5000');

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [emergencyInfo, setEmergencyInfo] = useState({ title: '', message: '' });

    useEffect(() => {
        // Fetch initial state
        systemService.getEmergencyState()
            .then(res => {
                setEmergencyMode(res.data.isEmergency);
                setEmergencyInfo({ title: res.data.title, message: res.data.message });
            })
            .catch(err => console.error("Failed to fetch emergency state", err));

        // Listen for real-time toggles
        socket.on('emergency_mode', (data) => {
            setEmergencyMode(data.active);
            if (data.title !== undefined) {
                setEmergencyInfo({ title: data.title, message: data.message });
            }
        });

        return () => {
            socket.off('emergency_mode');
        };
    }, []);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        setUser(res.data.user);
        return res.data.user;
    };

    const sendOtp = async (phone_number) => {
        return await authService.sendOtp({ phone_number });
    };

    const logout = () => {
        setUser(null);
        setAdminToken(null);
        localStorage.removeItem('adminToken');
    };

    const updateProfile = async (id, data) => {
        const res = await authService.updateProfile(id, data);
        setUser(res.data.user);
        return res.data.user;
    };

    const loadProfile = async (id) => {
        const res = await authService.getProfile(id);
        return res.data;
    };

    const deleteProfile = async (id) => {
        await authService.deleteProfile(id);
        logout();
    };

    const value = {
        user,
        setUser,
        adminToken,
        setAdminToken,
        login,
        sendOtp,
        logout,
        updateProfile,
        loadProfile,
        deleteProfile,
        emergencyMode,
        setEmergencyMode,
        emergencyInfo,
        setEmergencyInfo
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
