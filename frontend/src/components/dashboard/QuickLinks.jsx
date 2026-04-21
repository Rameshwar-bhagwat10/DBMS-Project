/**
 * QuickLinks — Navigation shortcut cards with icons and hover effects.
 */
import { Link } from "react-router-dom";

const linkConfig = {
	books: {
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
				<path d="M8 7h6" />
				<path d="M8 11h4" />
			</svg>
		),
		color: "text-sky-600 bg-sky-50 group-hover/card:bg-sky-100",
		hoverBorder: "hover:border-sky-200",
	},
	members: {
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
		color: "text-violet-600 bg-violet-50 group-hover/card:bg-violet-100",
		hoverBorder: "hover:border-violet-200",
	},
	issues: {
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
				<path d="M14 2v4a2 2 0 0 0 2 2h4" />
				<path d="M9 15l2 2 4-4" />
			</svg>
		),
		color: "text-emerald-600 bg-emerald-50 group-hover/card:bg-emerald-100",
		hoverBorder: "hover:border-emerald-200",
	},
	fines: {
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<circle cx="12" cy="12" r="10" />
				<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
				<path d="M12 18V6" />
			</svg>
		),
		color: "text-amber-600 bg-amber-50 group-hover/card:bg-amber-100",
		hoverBorder: "hover:border-amber-200",
	},
	reports: {
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M3 3v16a2 2 0 0 0 2 2h16" />
				<path d="m7 16 4-8 4 4 4-12" />
			</svg>
		),
		color: "text-rose-600 bg-rose-50 group-hover/card:bg-rose-100",
		hoverBorder: "hover:border-rose-200",
	},
};

function QuickLinks({ links = [] }) {
	return (
		<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
			{/* Header */}
			<div className="mb-4 flex items-center gap-2.5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-600">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-stone-800">Quick Links</h3>
					<p className="text-[11px] text-stone-400">Jump to any section</p>
				</div>
			</div>

			{/* Links grid */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{links.map((link) => {
					const config = linkConfig[link.id] || linkConfig.books;
					return (
						<Link
							key={link.id}
							to={link.to}
							className={[
								"group/card flex items-center gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 px-3.5 py-3",
								"transition-all duration-200 hover:bg-white hover:shadow-sm hover:-translate-y-0.5",
								config.hoverBorder,
							].join(" ")}
						>
							<div
								className={[
									"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
									config.color,
								].join(" ")}
							>
								{config.icon}
							</div>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-stone-800">{link.title}</p>
								<p className="truncate text-[11px] text-stone-400">{link.subtitle}</p>
							</div>
							{/* Arrow */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-4 w-4 shrink-0 text-stone-300 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:text-stone-500">
								<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
							</svg>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

export default QuickLinks;
