import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Books from "../pages/Books.jsx";
import Members from "../pages/Members.jsx";
import Issues from "../pages/Issues.jsx";
import Fines from "../pages/Fines.jsx";
import Reports from "../pages/Reports.jsx";

function AppRoutes() {
	return (
		<Routes>
			{/* Public route */}
			<Route path="/login" element={<Login />} />

			{/* Protected routes */}
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Dashboard />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/books"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Books />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/members"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Members />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/issues"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Issues />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/fines"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Fines />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/reports"
				element={
					<ProtectedRoute>
						<MainLayout>
							<Reports />
						</MainLayout>
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

export default AppRoutes;