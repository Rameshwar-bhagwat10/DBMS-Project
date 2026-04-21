import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
	const { login, isAuthenticated } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// If already logged in, redirect to dashboard.
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
		} catch (requestError) {
			setError(requestError?.response?.data?.message || "Login failed. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900">
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute inset-0" style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
					backgroundSize: "40px 40px",
				}}></div>
			</div>

			{/* Gradient orbs */}
			<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"></div>
			<div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"></div>

			{/* Login card */}
			<div className="relative z-10 w-full max-w-md px-4">
				{/* Logo / Brand */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
							<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-white">Library Manager</h1>
					<p className="mt-1.5 text-sm text-slate-400">Sign in to your librarian account</p>
				</div>

				{/* Form card */}
				<div className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email */}
						<div>
							<label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
								Email
							</label>
							<div className="relative">
								<span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
										<path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
										<path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
									</svg>
								</span>
								<input
									id="login-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									autoComplete="email"
									className="w-full rounded-xl border border-slate-600/50 bg-slate-700/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
								Password
							</label>
							<div className="relative">
								<span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
										<path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
									</svg>
								</span>
								<input
									id="login-password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									autoComplete="current-password"
									className="w-full rounded-xl border border-slate-600/50 bg-slate-700/50 py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
								>
									{showPassword ? (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
											<path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
											<path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
											<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
											<path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Error */}
						{error ? (
							<div className="flex items-center gap-2.5 rounded-lg bg-rose-500/10 px-3.5 py-2.5">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-400">
									<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
								</svg>
								<p className="text-xs font-medium text-rose-300">{error}</p>
							</div>
						) : null}

						{/* Submit */}
						<button
							type="submit"
							disabled={loading || !email.trim() || !password.trim()}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? (
								<>
									<svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Signing in...
								</>
							) : (
								<>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
										<path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
										<path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
									</svg>
									Sign In
								</>
							)}
						</button>
					</form>
				</div>

				{/* Footer */}
				<p className="mt-6 text-center text-xs text-slate-500">
					Library Management System &mdash; Authorized Access Only
				</p>
			</div>
		</div>
	);
}

export default Login;
