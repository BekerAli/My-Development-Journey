
import { createContext, useContext, useState } from "react";

import { login as loginService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    // 1. Restore saved user
    const [user, setUser] = useState(() => {
        try {
            const savedUserData = localStorage.getItem("eduTrackUserData");

            return savedUserData
                ? JSON.parse(savedUserData)
                : null;

        } catch (error) {
            localStorage.removeItem("eduTrackUserData");
            return null;
        }
    });

    // 2. Check authentication
    const isAuthenticated = Boolean(user);

    // 3. Login
    function login(credentials) {
        const loginResult = loginService(credentials);

        if (loginResult.success) {
            localStorage.setItem(
                "eduTrackUserData",
                JSON.stringify(loginResult.user)
            );

            setUser(loginResult.user);
        }

        return loginResult;
    }

    // 4. Logout
    function logout() {
        localStorage.removeItem("eduTrackUserData");
        setUser(null);
    }

    // 5. Share authentication information
    const loginValue = {
        user,
        isAuthenticated,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={loginValue}>
            {children}
        </AuthContext.Provider>
    );
}

// 6. Custom authentication hook
export function useAuth() {
    return useContext(AuthContext);
}
