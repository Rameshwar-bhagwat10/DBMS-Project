import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Wraps protected routes — redirects to /login if not authenticated.
 * Shows a loading spinner while the initial auth check is in progress.
 */
function ProtectedRoute({ children }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-stone-50">
				<div className="text-center">
					<svg className="mx-auto h-10 w-10 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
					<p className="mt-3 text-sm font-medium text-stone-500">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export default ProtectedRoute;
