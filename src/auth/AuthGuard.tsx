import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function AuthGuard() {
	const { isAuthenticated, isInitializing } = useAuth();
	const location = useLocation();

	if (isInitializing) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-surface">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
}
