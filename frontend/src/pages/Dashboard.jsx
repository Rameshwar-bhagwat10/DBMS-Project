import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../services/bookService";
import { getUnpaidFines } from "../services/fineService";
import { getActiveIssues } from "../services/issueService";
import { getMembers } from "../services/memberService";

import StatCard from "../components/dashboard/StatCard.jsx";
import AlertsPanel from "../components/dashboard/AlertsPanel.jsx";
import QuickLinks from "../components/dashboard/QuickLinks.jsx";
import IssueOverviewChart from "../components/dashboard/IssueOverviewChart.jsx";
import LibraryStatsBar from "../components/dashboard/LibraryStatsBar.jsx";

const PAGE_SIZE = 1;

/* ── Stat card icons (inline SVG) ── */
const icons = {
	books: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
			<path d="M8 7h6" /><path d="M8 11h4" />
		</svg>
	),
	members: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
	active: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15l2 2 4-4" />
		</svg>
	),
	overdue: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
		</svg>
	),
	fines: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<circle cx="12" cy="12" r="10" />
			<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
		</svg>
	),
	amount: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l-1.5 2" />
			<path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l-1.5 2" />
			<path d="M7 7h10" /><path d="M12 2v5" />
		</svg>
	),
};

/* ── Quick links data ── */
const quickLinksData = [
	{ id: "books", to: "/books", title: "Books", subtitle: "Manage catalog and stock" },
	{ id: "members", to: "/members", title: "Members", subtitle: "Add and update members" },
	{ id: "issues", to: "/issues", title: "Issues", subtitle: "Issue and return books" },
	{ id: "fines", to: "/fines", title: "Fines", subtitle: "Collect pending fines" },
	{ id: "reports", to: "/reports", title: "Reports", subtitle: "Review performance insights" },
];

function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [reloadKey, setReloadKey] = useState(0);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [stats, setStats] = useState({
		totalBooks: 0,
		totalMembers: 0,
		activeIssues: 0,
		overdueIssues: 0,
		dueTodayIssues: 0,
		dueSoonIssues: 0,
		unpaidFines: 0,
		unpaidFineAmount: 0,
	});

	useEffect(() => {
		let cancelled = false;

		async function loadDashboardStats() {
			setError("");

			try {
				const [booksResponse, membersResponse, activeIssues, unpaidFines] = await Promise.all([
					getBooks({ page: 1, limit: PAGE_SIZE }),
					getMembers({ page: 1, limit: PAGE_SIZE }),
					getActiveIssues(),
					getUnpaidFines(),
				]);

				if (cancelled) {
					return;
				}

				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const soonDate = new Date(today);
				soonDate.setDate(soonDate.getDate() + 3);

				const activeIssueRows = Array.isArray(activeIssues) ? activeIssues : [];
				const fineRows = Array.isArray(unpaidFines) ? unpaidFines : [];

				const overdueIssues = activeIssueRows.filter((issue) => {
					const dueDate = new Date(issue.due_date);
					dueDate.setHours(0, 0, 0, 0);
					return dueDate < today;
				}).length;

				const dueTodayIssues = activeIssueRows.filter((issue) => {
					const dueDate = new Date(issue.due_date);
					dueDate.setHours(0, 0, 0, 0);
					return dueDate.getTime() === today.getTime();
				}).length;

				const dueSoonIssues = activeIssueRows.filter((issue) => {
					const dueDate = new Date(issue.due_date);
					dueDate.setHours(0, 0, 0, 0);
					return dueDate > today && dueDate <= soonDate;
				}).length;

				const unpaidFineAmount = fineRows.reduce(
					(total, fine) => total + Number(fine.amount || 0),
					0
				);

				setStats({
					totalBooks: Number(booksResponse.pagination?.total_items || booksResponse.items.length),
					totalMembers: Number(membersResponse.pagination?.total_items || membersResponse.items.length),
					activeIssues: activeIssueRows.length,
					overdueIssues,
					dueTodayIssues,
					dueSoonIssues,
					unpaidFines: fineRows.length,
					unpaidFineAmount,
				});
				setLastUpdated(new Date());
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error loading dashboard data");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadDashboardStats();

		return () => {
			cancelled = true;
		};
	}, [reloadKey]);

	function handleRefresh() {
		if (loading) {
			return;
		}

		setLoading(true);
		setReloadKey((previous) => previous + 1);
	}

	const alertItems = useMemo(
		() => [
			{
				id: "overdue",
				label: "Overdue returns",
				value: stats.overdueIssues,
				severity: stats.overdueIssues > 0 ? "critical" : "success",
			},
			{
				id: "today",
				label: "Due today",
				value: stats.dueTodayIssues,
				severity: stats.dueTodayIssues > 0 ? "warning" : "success",
			},
			{
				id: "soon",
				label: "Due in next 3 days",
				value: stats.dueSoonIssues,
				severity: stats.dueSoonIssues > 0 ? "info" : "success",
			},
			{
				id: "unpaid",
				label: "Unpaid fines",
				value: `${stats.unpaidFines} (₹${stats.unpaidFineAmount.toFixed(2)})`,
				severity: stats.unpaidFines > 0 ? "critical" : "success",
			},
		],
		[stats]
	);

	return (
		<div className="space-y-6">
			{/* ── Page header ── */}
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-2xl font-bold text-stone-900">Dashboard</h2>
					<p className="mt-1 text-sm text-stone-500">
						Important daily metrics for librarian operations.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<p className="text-[11px] text-stone-400">
						{lastUpdated
							? `Updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
							: "Not synced"}
					</p>
					<button
						onClick={handleRefresh}
						disabled={loading}
						className={[
							"inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5",
							"text-xs font-medium text-stone-600 shadow-sm",
							"transition-all duration-200 hover:bg-stone-50 hover:shadow",
							"disabled:cursor-not-allowed disabled:opacity-50",
						].join(" ")}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={["h-3.5 w-3.5", loading ? "animate-spin" : ""].join(" ")}>
							<path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.744a.75.75 0 0 0-.75.75v3.488a.75.75 0 0 0 1.5 0v-2.117l.28.282a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-10.9-2.063a.75.75 0 0 0 1.45.388 5.5 5.5 0 0 1 9.201-2.466l.312.311H13.06a.75.75 0 0 0 0 1.5h3.488a.75.75 0 0 0 .75-.75V4.756a.75.75 0 0 0-1.5 0v2.117l-.28-.282A7 7 0 0 0 3.839 9.71Z" clipRule="evenodd" />
						</svg>
						{loading ? "Refreshing..." : "Refresh"}
					</button>
				</div>
			</div>

			{/* ── Error banner ── */}
			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-rose-500">
						<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
					</svg>
					<p className="text-sm font-medium text-rose-700">{error}</p>
				</div>
			) : null}

			{/* ── Stat cards grid ── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard
					icon={icons.books}
					label="Total Books"
					value={stats.totalBooks}
					loading={loading}
					accentColor="sky"
					subtitle="In library catalog"
				/>
				<StatCard
					icon={icons.members}
					label="Total Members"
					value={stats.totalMembers}
					loading={loading}
					accentColor="violet"
					subtitle="Registered members"
				/>
				<StatCard
					icon={icons.active}
					label="Active Issues"
					value={stats.activeIssues}
					loading={loading}
					accentColor="emerald"
					subtitle="Currently issued"
				/>
				<StatCard
					icon={icons.overdue}
					label="Overdue Issues"
					value={stats.overdueIssues}
					loading={loading}
					accentColor="amber"
					subtitle="Past due date"
				/>
				<StatCard
					icon={icons.fines}
					label="Unpaid Fines"
					value={stats.unpaidFines}
					loading={loading}
					accentColor="rose"
					subtitle="Pending collection"
				/>
				<StatCard
					icon={icons.amount}
					label="Outstanding Amount"
					value={`₹${stats.unpaidFineAmount.toFixed(2)}`}
					loading={loading}
					accentColor="rose"
					subtitle="Total fine value"
				/>
			</div>

			{/* ── Charts row ── */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<IssueOverviewChart stats={stats} loading={loading} />
				<LibraryStatsBar stats={stats} loading={loading} />
			</div>

			{/* ── Alerts + Quick Links row ── */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<AlertsPanel alerts={alertItems} loading={loading} />
				<QuickLinks links={quickLinksData} />
			</div>
		</div>
	);
}

export default Dashboard;
