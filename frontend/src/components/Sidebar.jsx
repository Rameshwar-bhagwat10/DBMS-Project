import { NavLink } from "react-router-dom";

/* ── SVG icon components (inline to avoid external deps) ── */

function DashboardIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<rect width="7" height="9" x="3" y="3" rx="1" />
			<rect width="7" height="5" x="14" y="3" rx="1" />
			<rect width="7" height="9" x="14" y="12" rx="1" />
			<rect width="7" height="5" x="3" y="16" rx="1" />
		</svg>
	);
}

function BooksIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
			<path d="M8 7h6" />
			<path d="M8 11h4" />
		</svg>
	);
}

function MembersIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}

function IssuesIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M9 15l2 2 4-4" />
		</svg>
	);
}

function FinesIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<circle cx="12" cy="12" r="10" />
			<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
			<path d="M12 18V6" />
		</svg>
	);
}

function ReportsIcon({ className }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<path d="M3 3v16a2 2 0 0 0 2 2h16" />
			<path d="m7 16 4-8 4 4 4-12" />
		</svg>
	);
}

const menuItems = [
	{ path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
	{ path: "/books", label: "Books", icon: BooksIcon },
	{ path: "/members", label: "Members", icon: MembersIcon },
	{ path: "/issues", label: "Issues", icon: IssuesIcon },
	{ path: "/fines", label: "Fines", icon: FinesIcon },
	{ path: "/reports", label: "Reports", icon: ReportsIcon },
];

function Sidebar() {
	return (
		<aside
			className="group/sidebar flex w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100/80"
			id="main-sidebar"
		>
			{/* Section label */}
			<div className="px-5 pb-2 pt-5">
				<p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
					Navigation
				</p>
			</div>

			{/* Nav links */}
			<nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
				{menuItems.map((item) => {
					const IconComponent = item.icon;
					return (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) =>
								[
									"group/link relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium",
									"transition-all duration-200 ease-out",
									isActive
										? "bg-slate-800 text-white shadow-md shadow-slate-800/25"
										: "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
								].join(" ")
							}
						>
							{({ isActive }) => (
								<>
									{/* Active indicator bar */}
									{isActive && (
										<span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
									)}

									{/* Icon */}
									<IconComponent
										className={[
											"h-[18px] w-[18px] shrink-0 transition-transform duration-200",
											isActive
												? "text-amber-300"
												: "text-slate-400 group-hover/link:text-slate-700 group-hover/link:scale-110",
										].join(" ")}
									/>

									{/* Label */}
									<span className="truncate">{item.label}</span>

									{/* Active dot */}
									{isActive && (
										<span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
									)}
								</>
							)}
						</NavLink>
					);
				})}

				{/* Spacer */}
				<div className="flex-1"></div>

				{/* Bottom info card */}
				<div className="mt-4 rounded-xl border border-slate-200 bg-white/60 p-4 backdrop-blur-sm">
					<div className="mb-2 flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-amber-700">
								<circle cx="12" cy="12" r="10" />
								<path d="M12 16v-4" />
								<path d="M12 8h.01" />
							</svg>
						</div>
						<span className="text-xs font-semibold text-slate-700">Quick Tip</span>
					</div>
					<p className="text-[11px] leading-relaxed text-slate-500">
						Use <span className="font-semibold text-slate-600">Book ID</span> and <span className="font-semibold text-slate-600">Member ID</span> from their respective pages when issuing books.
					</p>
				</div>
			</nav>
		</aside>
	);
}

export default Sidebar;