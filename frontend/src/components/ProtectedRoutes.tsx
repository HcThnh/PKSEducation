import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login"></Navigate>
    }

    return <Outlet />
}

export const AdminRoute: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login"></Navigate>
    }

    if (!isAdmin) {
        return <Navigate to="/" replace></Navigate>
    }

    return <Outlet />
}