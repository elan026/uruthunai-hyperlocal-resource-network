import { createContext, useContext, useState, useEffect } from 'react';
import { authService, systemService, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);
const socket = io(SOCKET_URL);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [emergencyInfo, setEmergencyInfo] = useState({ title: '', message: '' });
    const [hillStationDangerMode, setHillStationDangerMode] = useState(false);

    useEffect(() => {
        // Fetch initial state
        systemService.getEmergencyState()
            .then(res => {
                setEmergencyMode(res.data.isEmergency);
                setEmergencyInfo({ title: res.data.title, message: res.data.message });
            })
            .catch(() => { /* Silenced: defaults to non-emergency mode on failure */ });

        // Listen for real-time toggles
        socket.on('emergency_mode', (data) => {
            setEmergencyMode(data.active);
            if (data.title !== undefined) {
                setEmergencyInfo({ title: data.title, message: data.message });
            }
        });

        socket.on('danger_mode_update', (data) => {
            if (user?.area_code === data.area_code || data.area_code === '638461 - Thalavadi' || data.area_code === '636601 - Yercaud' || data.area_code === '641301 - Valparai') {
                setHillStationDangerMode(data.is_danger_mode);
            }
        });

        return () => {
            socket.off('emergency_mode');
            socket.off('danger_mode_update');
        };
    }, [user?.area_code]);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        setUser(res.data.user);
        return res.data.user;
    };

    const googleLogin = async (idToken) => {
        const res = await authService.googleLogin(idToken);
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
        googleLogin,
        sendOtp,
        logout,
        updateProfile,
        loadProfile,
        deleteProfile,
        emergencyMode,
        setEmergencyMode,
        emergencyInfo,
        setEmergencyInfo,
        hillStationDangerMode,
        setHillStationDangerMode
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
