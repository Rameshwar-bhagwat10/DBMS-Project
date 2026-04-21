/**
 * IssueOverviewChart — Donut chart showing issue status breakdown.
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444"];

function CustomTooltip({ active, payload }) {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
				<p className="text-xs font-semibold text-stone-700">{payload[0].name}</p>
				<p className="text-lg font-bold text-stone-900">{payload[0].value}</p>
			</div>
		);
	}
	return null;
}

function IssueOverviewChart({ stats, loading }) {
	const chartData = [
		{ name: "Active (On Time)", value: Math.max(0, stats.activeIssues - stats.overdueIssues - stats.dueTodayIssues - stats.dueSoonIssues) },
		{ name: "Due Soon", value: stats.dueSoonIssues },
		{ name: "Due Today", value: stats.dueTodayIssues },
		{ name: "Overdue", value: stats.overdueIssues },
	].filter((d) => d.value > 0);

	const hasData = chartData.length > 0 && !loading;

	return (
		<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
			{/* Header */}
			<div className="mb-4 flex items-center gap-2.5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
						<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
						<path d="M22 12A10 10 0 0 0 12 2v10z" />
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-stone-800">Issue Overview</h3>
					<p className="text-[11px] text-stone-400">Active issue status breakdown</p>
				</div>
			</div>

			{hasData ? (
				<div className="flex items-center gap-4">
					{/* Chart */}
					<div className="h-[160px] w-[160px] shrink-0">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="50%"
									innerRadius={45}
									outerRadius={70}
									paddingAngle={3}
									dataKey="value"
									stroke="none"
								>
									{chartData.map((entry, index) => (
										<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* Legend */}
					<div className="flex flex-col gap-2">
						{chartData.map((entry, index) => (
							<div key={entry.name} className="flex items-center gap-2.5">
								<span
									className="inline-block h-3 w-3 rounded-sm"
									style={{ backgroundColor: COLORS[index % COLORS.length] }}
								></span>
								<div>
									<p className="text-xs font-medium text-stone-600">{entry.name}</p>
									<p className="text-sm font-bold text-stone-800">{entry.value}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="flex h-[160px] items-center justify-center">
					<div className="text-center">
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-stone-400">
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
						</div>
						<p className="text-sm font-medium text-stone-500">
							{loading ? "Loading chart..." : "No active issues"}
						</p>
						<p className="text-[11px] text-stone-400">
							{loading ? "" : "All books returned on time!"}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default IssueOverviewChart;
