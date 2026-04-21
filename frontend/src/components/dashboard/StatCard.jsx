/**
 * StatCard — A premium dashboard metric card with icon, value, label, and trend indicator.
 */
function StatCard({ icon, label, value, loading, accentColor = "slate", subtitle }) {
	const colorMap = {
		slate: {
			iconBg: "bg-slate-100",
			iconText: "text-slate-600",
			value: "text-slate-900",
			ring: "ring-slate-200/60",
		},
		amber: {
			iconBg: "bg-amber-50",
			iconText: "text-amber-600",
			value: "text-amber-700",
			ring: "ring-amber-200/60",
		},
		emerald: {
			iconBg: "bg-emerald-50",
			iconText: "text-emerald-600",
			value: "text-emerald-700",
			ring: "ring-emerald-200/60",
		},
		rose: {
			iconBg: "bg-rose-50",
			iconText: "text-rose-600",
			value: "text-rose-700",
			ring: "ring-rose-200/60",
		},
		sky: {
			iconBg: "bg-sky-50",
			iconText: "text-sky-600",
			value: "text-sky-700",
			ring: "ring-sky-200/60",
		},
		violet: {
			iconBg: "bg-violet-50",
			iconText: "text-violet-600",
			value: "text-violet-700",
			ring: "ring-violet-200/60",
		},
	};

	const colors = colorMap[accentColor] || colorMap.slate;

	return (
		<div
			className={[
				"group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5",
				"shadow-sm ring-1 transition-all duration-300",
				"hover:shadow-md hover:-translate-y-0.5",
				colors.ring,
			].join(" ")}
		>
			{/* Decorative corner gradient */}
			<div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-stone-100/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

			<div className="flex items-start justify-between gap-3">
				{/* Icon */}
				<div
					className={[
						"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
						"transition-transform duration-300 group-hover:scale-110",
						colors.iconBg,
					].join(" ")}
				>
					<span className={colors.iconText}>{icon}</span>
				</div>

				{/* Content */}
				<div className="flex-1 text-right">
					<p className="text-xs font-medium uppercase tracking-wider text-stone-400">
						{label}
					</p>
					<p
						className={[
							"mt-1 text-2xl font-bold tracking-tight",
							loading ? "animate-pulse text-stone-300" : colors.value,
						].join(" ")}
					>
						{loading ? "—" : value}
					</p>
					{subtitle && !loading ? (
						<p className="mt-0.5 text-[11px] text-stone-400">{subtitle}</p>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default StatCard;
