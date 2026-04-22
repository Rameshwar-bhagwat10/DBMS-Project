import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "lib_auth_token";

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
	const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

	// On mount, validate stored token by calling /auth/me.
	useEffect(() => {
		if (!token) {
			return;
		}

		let cancelled = false;

		async function validate() {
			try {
				const userData = await getCurrentUser();

				if (!cancelled) {
					setUser(userData);
				}
			} catch {
				// Token invalid — clear it.
				if (!cancelled) {
					localStorage.removeItem(TOKEN_KEY);
					setToken(null);
					setUser(null);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		validate();

		return () => {
			cancelled = true;
		};
	}, [token]);

	async function login(email, password) {
		const result = await loginUser(email, password);

		localStorage.setItem(TOKEN_KEY, result.token);
		setToken(result.token);
		setUser(result.user);

		return result;
	}

	function logout() {
		localStorage.removeItem(TOKEN_KEY);
		setToken(null);
		setUser(null);
		setLoading(false);

		// Fire-and-forget: local logout should still complete if backend is unavailable.
		void logoutUser().catch(() => {});
	}

	/**
	 * Refreshes user data from the server (call after profile update).
	 */
	async function refreshUser() {
		try {
			const userData = await getCurrentUser();
			setUser(userData);
		} catch {
			// Ignore errors — user data will be stale but that's OK.
		}
	}

	const isAuthenticated = Boolean(token && user);

	return (
		<AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
