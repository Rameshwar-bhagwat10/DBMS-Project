import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const pageTitles = {
	"/dashboard": "Dashboard",
	"/books": "Books",
	"/members": "Members",
	"/issues": "Issues",
	"/fines": "Fines",
	"/reports": "Reports",
};

function Navbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	const currentPage = pageTitles[location.pathname] || "Library Manager";

	const formattedDate = currentTime.toLocaleDateString("en-IN", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	const formattedTime = currentTime.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

	return (
		<header className="sticky top-0 z-30" id="main-navbar">
			{/* Main navbar */}
			<div className="relative bg-slate-900 px-5 py-3 shadow-lg shadow-slate-900/30">
				<div className="flex items-center justify-between">
					{/* Left — Logo + Branding */}
					<div className="flex items-center gap-3.5">
						{/* Book icon logo */}
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/20 transition-transform duration-300 hover:scale-105 hover:bg-amber-500/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5 text-amber-400"
							>
								<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
								<path d="M8 7h6" />
								<path d="M8 11h4" />
							</svg>
						</div>

						{/* App name + breadcrumb */}
						<div className="flex flex-col">
							<h1 className="text-[17px] font-bold tracking-wide text-white">
								Library Manager
							</h1>
							<div className="flex items-center gap-1.5 text-xs text-slate-400">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									className="h-3 w-3 text-amber-500/70"
								>
									<path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.382a1.5 1.5 0 0 1-.44 1.06l-1.12 1.122A1.5 1.5 0 0 0 12 10.121V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 2 12.5v-9Z" />
								</svg>
								<span className="font-medium text-slate-300">{currentPage}</span>
							</div>
						</div>
					</div>

					{/* Right — Status + Date/Time */}
					<div className="flex items-center gap-4">
						{/* Live system status */}
						<div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 sm:flex">
							<span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
							<span className="text-xs font-medium text-slate-300">
								System Online
							</span>
						</div>

						{/* Divider */}
						<div className="hidden h-8 w-px bg-slate-700 sm:block"></div>

						{/* User info + Logout */}
						{user ? (
							<div className="hidden items-center gap-2.5 sm:flex">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white">
									{(user.name || user.username || "A").charAt(0).toUpperCase()}
								</div>
								<span className="text-xs font-medium text-slate-300">{user.name || user.username}</span>
								<button
									onClick={() => { logout(); navigate("/login"); }}
									className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 transition-all hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
									title="Logout"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
										<path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
										<path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						) : null}

						{/* Divider */}
						<div className="hidden h-8 w-px bg-slate-700 sm:block"></div>

						{/* Date & Time */}
						<div className="flex items-center gap-2.5 text-right">
							<div className="flex flex-col">
								<span className="text-xs font-semibold tracking-wide text-white">
									{formattedTime}
								</span>
								<span className="text-[11px] text-slate-400">
									{formattedDate}
								</span>
							</div>

							{/* Calendar icon */}
							<div className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 sm:flex">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4 text-slate-400"
								>
									<rect width="18" height="18" x="3" y="4" rx="2" />
									<path d="M16 2v4" />
									<path d="M8 2v4" />
									<path d="M3 10h18" />
									<path d="M8 14h.01" />
									<path d="M12 14h.01" />
									<path d="M16 14h.01" />
									<path d="M8 18h.01" />
									<path d="M12 18h.01" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom accent line — amber to match sidebar active indicators */}
			<div className="h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 opacity-60"></div>
		</header>
	);
}

export default Navbar;
