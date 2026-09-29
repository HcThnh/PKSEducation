import { createContext, useContext, useState } from "react";

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string, userDate: User) => void;
    logout: () => void;
    register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children}) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    })

    const [accessToken, setAccessToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    })

    const isAuthenticated = !!accessToken && !!user;

    const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

    const login = (token: string, userData: User) => {
        setAccessToken(token);
        setUser(userData);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
    }

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    const register = async (_data: any) => {

    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated,
                isAdmin,
                login,
                logout,
                register,
            }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}