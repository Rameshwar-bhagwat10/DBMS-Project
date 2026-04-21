import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import {
	getMostIssuedBooksReport,
	getTopBorrowingMembersReport,
	getTotalFinesCollectedReport,
} from "../services/issueService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/* ── Custom tooltip ── */
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

/* ── Table headers ── */
const mostIssuedHeaders = [
	{
		key: "rank",
		label: "#",
		render: (row) => (
			<span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-[10px] font-bold text-amber-600">
				{row.rank}
			</span>
		),
	},
	{
		key: "title",
		label: "Book Title",
		render: (row) => (
			<div className="flex items-center gap-2.5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
						<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
					</svg>
				</div>
				<span className="text-sm font-semibold text-stone-800">{row.title}</span>
			</div>
		),
	},
	{
		key: "issue_count",
		label: "Times Issued",
		render: (row) => (
			<span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
				{row.issue_count}
			</span>
		),
	},
];

const topMembersHeaders = [
	{
		key: "rank",
		label: "#",
		render: (row) => (
			<span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-[10px] font-bold text-violet-600">
				{row.rank}
			</span>
		),
	},
	{
		key: "name",
		label: "Member Name",
		render: (row) => (
			<div className="flex items-center gap-2.5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white">
					{(row.name || "?").charAt(0).toUpperCase()}
				</div>
				<span className="text-sm font-semibold text-stone-800">{row.name}</span>
			</div>
		),
	},
	{
		key: "total_issues",
		label: "Total Borrowings",
		render: (row) => (
			<span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
				{row.total_issues}
			</span>
		),
	},
];

/* ── Error banner ── */
function ErrorBanner({ message }) {
	if (!message) return null;
	return (
		<div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-rose-500">
				<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
			</svg>
			<p className="text-sm font-medium text-rose-700">{message}</p>
		</div>
	);
}

function Reports() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [mostIssuedBooks, setMostIssuedBooks] = useState([]);
	const [topBorrowers, setTopBorrowers] = useState([]);
	const [totalFinesCollected, setTotalFinesCollected] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function loadReports() {
			try {
				const [mostIssued, topMembers, finesSummary] = await Promise.all([
					getMostIssuedBooksReport({ limit: 10 }),
					getTopBorrowingMembersReport({ limit: 10 }),
					getTotalFinesCollectedReport(),
				]);

				if (cancelled) {
					return;
				}

				setMostIssuedBooks(Array.isArray(mostIssued) ? mostIssued : []);
				setTopBorrowers(Array.isArray(topMembers) ? topMembers : []);
				setTotalFinesCollected(Number(finesSummary?.total_fines_collected || 0));
				setError("");
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error loading reports");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadReports();

		return () => {
			cancelled = true;
		};
	}, []);

	const mostIssuedRows = mostIssuedBooks.map((row, index) => ({
		id: row.book_id || index,
		rank: index + 1,
		title: row.title,
		issue_count: row.issue_count,
	}));

	const topMemberRows = topBorrowers.map((row, index) => ({
		id: row.member_id || index,
		rank: index + 1,
		name: row.name,
		total_issues: row.total_issues,
	}));

	/* ── Chart data ── */
	const bookChartData = mostIssuedBooks.slice(0, 5).map((b) => ({
		name: b.title.length > 15 ? b.title.slice(0, 15) + "…" : b.title,
		issues: Number(b.issue_count),
	}));

	const memberChartData = topBorrowers.slice(0, 5).map((m) => ({
		name: m.name.length > 12 ? m.name.slice(0, 12) + "…" : m.name,
		borrowings: Number(m.total_issues),
	}));

	return (
		<div className="space-y-5">
			{/* ── Page header ── */}
			<PageHeader
				title="Reports"
				subtitle="Insights from library usage and collections."
			/>

			<ErrorBanner message={error} />

			{/* ── Summary card ── */}
			<div className="rounded-2xl border border-stone-200/80 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm ring-1 ring-stone-200/60">
				<div className="flex items-center gap-4">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-emerald-600">
							<circle cx="12" cy="12" r="10" />
							<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
						</svg>
					</div>
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-stone-400">Total Fines Collected</p>
						<p className="mt-1 text-3xl font-bold text-emerald-700">
							{loading ? "—" : `₹${totalFinesCollected.toFixed(2)}`}
						</p>
						<p className="mt-0.5 text-[11px] text-stone-400">All-time collection</p>
					</div>
				</div>
			</div>

			{/* ── Charts row ── */}
			{!loading && (bookChartData.length > 0 || memberChartData.length > 0) ? (
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{/* Books chart */}
					{bookChartData.length > 0 ? (
						<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
							<div className="mb-4 flex items-center gap-2.5">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
										<path d="M3 3v16a2 2 0 0 0 2 2h16" /><rect x="7" y="13" width="9" height="4" rx="1" /><rect x="7" y="5" width="12" height="4" rx="1" />
									</svg>
								</div>
								<div>
									<h3 className="text-sm font-semibold text-stone-800">Top Books</h3>
									<p className="text-[11px] text-stone-400">Most issued books chart</p>
								</div>
							</div>
							<div className="h-[200px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={bookChartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
										<XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
										<YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
										<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
										<Bar dataKey="issues" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={32} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					) : null}

					{/* Members chart */}
					{memberChartData.length > 0 ? (
						<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
							<div className="mb-4 flex items-center gap-2.5">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-600">
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
									</svg>
								</div>
								<div>
									<h3 className="text-sm font-semibold text-stone-800">Top Members</h3>
									<p className="text-[11px] text-stone-400">Most active borrowers</p>
								</div>
							</div>
							<div className="h-[200px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={memberChartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
										<XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
										<YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
										<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
										<Bar dataKey="borrowings" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					) : null}
				</div>
			) : null}

			{/* ── Tables row ── */}
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
					<div className="mb-4 flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
								<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-stone-800">Most Issued Books</h3>
							<p className="text-[11px] text-stone-400">Top 10 by issue count</p>
						</div>
					</div>
					{loading ? (
						<div className="flex justify-center py-8">
							<svg className="h-6 w-6 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
						</div>
					) : (
						<Table headers={mostIssuedHeaders} data={mostIssuedRows} emptyText="No data yet." />
					)}
				</div>

				<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
					<div className="mb-4 flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-600">
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-stone-800">Top Borrowers</h3>
							<p className="text-[11px] text-stone-400">Most active members</p>
						</div>
					</div>
					{loading ? (
						<div className="flex justify-center py-8">
							<svg className="h-6 w-6 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
						</div>
					) : (
						<Table headers={topMembersHeaders} data={topMemberRows} emptyText="No data yet." />
					)}
				</div>
			</div>
		</div>
	);
}

export default Reports;
