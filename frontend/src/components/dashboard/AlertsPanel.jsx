/**
 * AlertsPanel — Shows librarian alerts with severity-colored indicators.
 */
function AlertsPanel({ alerts = [], loading }) {
	const severityMap = {
		critical: {
			dot: "bg-rose-500",
			bg: "bg-rose-50/60 border-rose-100",
			text: "text-rose-700",
			label: "text-stone-700",
		},
		warning: {
			dot: "bg-amber-500",
			bg: "bg-amber-50/60 border-amber-100",
			text: "text-amber-700",
			label: "text-stone-700",
		},
		info: {
			dot: "bg-sky-500",
			bg: "bg-sky-50/60 border-sky-100",
			text: "text-sky-700",
			label: "text-stone-700",
		},
		success: {
			dot: "bg-emerald-500",
			bg: "bg-emerald-50/60 border-emerald-100",
			text: "text-emerald-700",
			label: "text-stone-700",
		},
	};

	return (
		<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
			{/* Header */}
			<div className="mb-4 flex items-center gap-2.5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-amber-600">
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
						<path d="M12 9v4" />
						<path d="M12 17h.01" />
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-stone-800">Quick Insights</h3>
					<p className="text-[11px] text-stone-400">Real-time library alerts</p>
				</div>
			</div>

			{/* Alert items */}
			<div className="space-y-2">
				{alerts.map((alert) => {
					const severity = severityMap[alert.severity] || severityMap.info;
					return (
						<div
							key={alert.id}
							className={[
								"flex items-center justify-between rounded-xl border px-4 py-3",
								"transition-all duration-200 hover:shadow-sm",
								severity.bg,
							].join(" ")}
						>
							<div className="flex items-center gap-3">
								<span
									className={[
										"inline-block h-2 w-2 rounded-full",
										severity.dot,
									].join(" ")}
								></span>
								<span className={["text-sm font-medium", severity.label].join(" ")}>
									{alert.label}
								</span>
							</div>
							<span
								className={[
									"text-sm font-bold tabular-nums",
									loading ? "animate-pulse text-stone-300" : severity.text,
								].join(" ")}
							>
								{loading ? "—" : alert.value}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default AlertsPanel;
