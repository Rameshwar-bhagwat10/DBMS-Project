/**
 * LibraryStatsBar — Horizontal bar chart showing library resource distribution.
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload, label }) {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
				<p className="text-xs font-medium text-stone-500">{label}</p>
				<p className="text-lg font-bold text-stone-900">{payload[0].value}</p>
			</div>
		);
	}
	return null;
}

function LibraryStatsBar({ stats, loading }) {
	const chartData = [
		{ name: "Books", value: stats.totalBooks, fill: "#0ea5e9" },
		{ name: "Members", value: stats.totalMembers, fill: "#8b5cf6" },
		{ name: "Active Issues", value: stats.activeIssues, fill: "#10b981" },
		{ name: "Unpaid Fines", value: stats.unpaidFines, fill: "#f59e0b" },
	];

	return (
		<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
			{/* Header */}
			<div className="mb-4 flex items-center gap-2.5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-600">
						<path d="M3 3v16a2 2 0 0 0 2 2h16" />
						<rect x="7" y="13" width="9" height="4" rx="1" />
						<rect x="7" y="5" width="12" height="4" rx="1" />
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-stone-800">Library Overview</h3>
					<p className="text-[11px] text-stone-400">Resource distribution at a glance</p>
				</div>
			</div>

			{loading ? (
				<div className="flex h-[200px] items-center justify-center">
					<p className="text-sm text-stone-400 animate-pulse">Loading chart...</p>
				</div>
			) : (
				<div className="h-[200px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
							<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
							<XAxis type="number" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
							<YAxis
								type="category"
								dataKey="name"
								tick={{ fontSize: 12, fill: "#57534e", fontWeight: 500 }}
								width={100}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
							<Bar
								dataKey="value"
								radius={[0, 6, 6, 0]}
								barSize={24}
							>
								{chartData.map((entry) => (
									<Bar key={entry.name} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}

export default LibraryStatsBar;
