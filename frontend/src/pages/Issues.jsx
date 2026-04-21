import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import Table from "../components/Table.jsx";
import { getIssues, issueBook, returnBook } from "../services/issueService";

const PAGE_SIZE = 10;

/* ── Status badge helper ── */
function StatusBadge({ returned, dueDate }) {
	if (returned) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
					<path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
				</svg>
				Returned
			</span>
		);
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(dueDate);
	due.setHours(0, 0, 0, 0);

	if (due < today) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
				<span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500"></span>
				Overdue
			</span>
		);
	}

	if (due.getTime() === today.getTime()) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
				<span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
				Due Today
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
			<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
			Active
		</span>
	);
}

/* ── Table headers ── */
const issueHeaders = [
	{
		key: "book_info",
		label: "Book",
		render: (row) => (
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
						<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
					</svg>
				</div>
				<div>
					<p className="font-semibold text-stone-800">{row.title}</p>
					<p className="mt-0.5 text-[11px] text-stone-400">ID: {row.book_id || "—"}</p>
				</div>
			</div>
		),
	},
	{
		key: "member_info",
		label: "Member",
		render: (row) => (
			<div className="flex items-center gap-2.5">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white">
					{(row.member_name || "?").charAt(0).toUpperCase()}
				</div>
				<span className="text-sm font-medium text-stone-700">{row.member_name}</span>
			</div>
		),
	},
	{
		key: "issue_date",
		label: "Issued",
		render: (row) => (
			<span className="text-sm text-stone-600">{row.issue_date}</span>
		),
	},
	{
		key: "due_date",
		label: "Due Date",
		render: (row) => (
			<span className="text-sm font-medium text-stone-700">{row.due_date}</span>
		),
	},
	{
		key: "status",
		label: "Status",
	},
	{
		key: "actions",
		label: "",
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

function Issues() {
	const [formData, setFormData] = useState({ book_id: "", member_id: "", days: "7" });
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [page, setPage] = useState(1);
	const [reloadKey, setReloadKey] = useState(0);
	const [issueFilter, setIssueFilter] = useState("all");
	const [sortBy, setSortBy] = useState("issue_date");
	const [sortOrder, setSortOrder] = useState("DESC");
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_SIZE,
		total_items: 0,
		total_pages: 1,
	});

	function triggerReload({ resetPage = false } = {}) {
		setLoading(true);

		if (resetPage && page !== 1) {
			setPage(1);
			return;
		}

		setReloadKey((previous) => previous + 1);
	}

	useEffect(() => {
		let cancelled = false;

		async function loadIssues() {
			try {
				const response = await getIssues({
					page,
					limit: PAGE_SIZE,
					sort: sortBy,
					order: sortOrder,
				});

				const nextItems = Array.isArray(response.items) ? response.items : [];
				const nextPagination = response.pagination || {
					page,
					limit: PAGE_SIZE,
					total_items: nextItems.length,
					total_pages: 1,
				};

				if (cancelled) {
					return;
				}

				setIssues(nextItems);
				setPagination(nextPagination);
				setError("");
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error fetching issues");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadIssues();

		return () => {
			cancelled = true;
		};
	}, [page, sortBy, sortOrder, reloadKey]);

	async function handleIssueBook() {
		setIsSubmitting(true);
		setActionError("");

		try {
			await issueBook({
				book_id: Number(formData.book_id),
				member_id: Number(formData.member_id),
				days: Number(formData.days),
			});

			setFormData({ book_id: "", member_id: "", days: "7" });
			triggerReload({ resetPage: true });
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error issuing book");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleReturnBook(issueId) {
		setActionError("");

		try {
			await returnBook(issueId);
			triggerReload();
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error returning book");
		}
	}

	function handleSortChange(event) {
		const [nextSortBy, nextSortOrder] = event.target.value.split("|");
		setLoading(true);
		setPage(1);
		setSortBy(nextSortBy);
		setSortOrder(nextSortOrder);
	}

	const filteredIssues = useMemo(() => {
		if (issueFilter === "active") {
			return issues.filter((issue) => issue.return_date === null);
		}

		if (issueFilter === "returned") {
			return issues.filter((issue) => issue.return_date !== null);
		}

		return issues;
	}, [issues, issueFilter]);

	const totalPages = Math.max(1, Number(pagination.total_pages) || 1);

	const issueRows = filteredIssues.map((issue) => ({
		id: issue.issue_id,
		title: issue.title,
		book_id: issue.book_id,
		member_name: issue.member_name,
		issue_date: issue.issue_date
			? new Date(issue.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
			: "—",
		due_date: issue.due_date
			? new Date(issue.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
			: "—",
		status: (
			<StatusBadge
				returned={issue.return_date !== null}
				dueDate={issue.due_date}
			/>
		),
		actions:
			issue.return_date === null ? (
				<button
					onClick={() => handleReturnBook(issue.issue_id)}
					className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:bg-emerald-100 hover:shadow-sm"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
						<path d="M7.628 1.099a.75.75 0 0 1 .744 0l5.25 3a.75.75 0 0 1 0 1.302l-5.25 3a.75.75 0 0 1-.744 0l-5.25-3a.75.75 0 0 1 0-1.302l5.25-3Z" />
						<path d="m2.57 7.24-.192.11a.75.75 0 0 0 0 1.302l5.25 3a.75.75 0 0 0 .744 0l5.25-3a.75.75 0 0 0 0-1.302l-.192-.11-4.314 2.465a2.25 2.25 0 0 1-2.232 0L2.57 7.24Z" />
						<path d="m2.57 10.74-.192.11a.75.75 0 0 0 0 1.302l5.25 3a.75.75 0 0 0 .744 0l5.25-3a.75.75 0 0 0 0-1.302l-.192-.11-4.314 2.465a2.25 2.25 0 0 1-2.232 0L2.57 10.74Z" />
					</svg>
					Return
				</button>
			) : null,
	}));

	const filterOptions = ["all", "active", "returned"];

	return (
		<div className="space-y-5">
			{/* ── Page header ── */}
			<PageHeader
				title="Issues"
				subtitle="Create and track issued books."
			/>

			{/* ── Issue Book Form ── */}
			<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
				<div className="mb-4 flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-600">
							<path d="M12 5v14" /><path d="M5 12h14" />
						</svg>
					</div>
					<div>
						<h3 className="text-sm font-semibold text-stone-800">Issue a Book</h3>
						<p className="text-[11px] text-stone-400">Enter Book ID and Member ID to issue</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					<Input
						id="issue-book-id"
						label="Book ID"
						placeholder="e.g. 3"
						value={formData.book_id}
						onChange={(event) =>
							setFormData((prev) => ({ ...prev, book_id: event.target.value }))
						}
					/>
					<Input
						id="issue-member-id"
						label="Member ID"
						placeholder="e.g. 1"
						value={formData.member_id}
						onChange={(event) =>
							setFormData((prev) => ({ ...prev, member_id: event.target.value }))
						}
					/>
					<Input
						id="issue-days"
						label="Loan Days"
						placeholder="7"
						type="number"
						value={formData.days}
						onChange={(event) => setFormData((prev) => ({ ...prev, days: event.target.value }))}
					/>
					<div className="flex items-end">
						<Button onClick={handleIssueBook} disabled={isSubmitting} className="w-full">
							{isSubmitting ? (
								<>
									<svg className="-ml-0.5 mr-1.5 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Issuing...
								</>
							) : (
								<>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="-ml-0.5 mr-1.5 h-4 w-4">
										<path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
									</svg>
									Issue Book
								</>
							)}
						</Button>
					</div>
				</div>

				{actionError ? (
					<div className="mt-3 rounded-lg bg-rose-50 px-3 py-2">
						<p className="text-xs font-medium text-rose-600">{actionError}</p>
					</div>
				) : null}
			</div>

			{/* ── Filter + Sort bar ── */}
			<Card>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Issue Status</p>
						<div className="flex gap-1.5">
							{filterOptions.map((filter) => (
								<button
									key={filter}
									onClick={() => setIssueFilter(filter)}
									className={[
										"rounded-lg px-3.5 py-2.5 text-xs font-medium capitalize transition-all duration-200",
										issueFilter === filter
											? "bg-slate-800 text-white shadow-sm"
											: "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50",
									].join(" ")}
								>
									{filter}
								</button>
							))}
						</div>
					</div>

					<div>
						<label htmlFor="issue-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
							Sort By
						</label>
						<select
							id="issue-sort"
							className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							value={`${sortBy}|${sortOrder}`}
							onChange={handleSortChange}
						>
							<option value="issue_date|DESC">Issue Date (Newest)</option>
							<option value="issue_date|ASC">Issue Date (Oldest)</option>
							<option value="due_date|ASC">Due Date (Nearest)</option>
							<option value="due_date|DESC">Due Date (Latest)</option>
						</select>
					</div>
				</div>
			</Card>

			{/* ── Errors ── */}
			<ErrorBanner message={error} />

			{/* ── Loading / Table ── */}
			{loading ? (
				<div className="flex items-center justify-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
					<div className="text-center">
						<svg className="mx-auto h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						<p className="mt-3 text-sm font-medium text-stone-500">Loading issues...</p>
					</div>
				</div>
			) : (
				<>
					<div className="flex items-center justify-between">
						<p className="text-xs text-stone-400">
							Showing <span className="font-semibold text-stone-600">{filteredIssues.length}</span> of{" "}
							<span className="font-semibold text-stone-600">{pagination.total_items}</span> issues
						</p>
					</div>

					<Table headers={issueHeaders} data={issueRows} emptyText="No issues found." />

					<Pagination
						page={page}
						totalPages={totalPages}
						loading={loading}
						onPrev={() => {
							setLoading(true);
							setPage((prev) => Math.max(1, prev - 1));
						}}
						onNext={() => {
							setLoading(true);
							setPage((prev) => Math.min(totalPages, prev + 1));
						}}
					/>
				</>
			)}
		</div>
	);
}

export default Issues;