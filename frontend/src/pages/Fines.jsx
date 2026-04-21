import { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import { getFines, getUnpaidFines, payFine } from "../services/fineService";

/* ── Table headers ── */
const fineHeaders = [
	{
		key: "member",
		label: "Member",
		render: (row) => (
			<div className="flex items-center gap-2.5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white">
					{(row.member || "?").charAt(0).toUpperCase()}
				</div>
				<span className="text-sm font-medium text-stone-700">{row.member}</span>
			</div>
		),
	},
	{
		key: "book",
		label: "Book",
		render: (row) => (
			<div className="flex items-center gap-2.5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-600">
						<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
					</svg>
				</div>
				<span className="text-sm font-medium text-stone-700">{row.book}</span>
			</div>
		),
	},
	{
		key: "amount",
		label: "Amount",
		render: (row) => (
			<span className="text-sm font-bold text-stone-800">{row.amount}</span>
		),
	},
	{
		key: "status",
		label: "Status",
		render: (row) => (
			<Badge variant={row.paid ? "success" : "danger"}>
				{row.paid ? "Paid" : "Unpaid"}
			</Badge>
		),
	},
	{ key: "actions", label: "" },
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

function Fines() {
	const [fines, setFines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [fineFilter, setFineFilter] = useState("all");
	const [reloadKey, setReloadKey] = useState(0);

	function triggerReload() {
		setLoading(true);
		setReloadKey((previous) => previous + 1);
	}

	useEffect(() => {
		let cancelled = false;

		async function loadFines() {
			try {
				const response = fineFilter === "unpaid" ? await getUnpaidFines() : await getFines();
				const nextRows = Array.isArray(response) ? response : [];

				if (cancelled) {
					return;
				}

				setFines(nextRows);
				setError("");
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error fetching fines");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadFines();

		return () => {
			cancelled = true;
		};
	}, [fineFilter, reloadKey]);

	async function handlePayFine(fineId) {
		setActionError("");

		try {
			await payFine(fineId);
			triggerReload();
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error paying fine");
		}
	}

	/* ── Summary stats ── */
	const stats = useMemo(() => {
		const totalFines = fines.length;
		const unpaidCount = fines.filter((f) => !f.paid).length;
		const paidCount = fines.filter((f) => f.paid).length;
		const totalAmount = fines.reduce((sum, f) => sum + Number(f.amount || 0), 0);
		const unpaidAmount = fines.filter((f) => !f.paid).reduce((sum, f) => sum + Number(f.amount || 0), 0);

		return { totalFines, unpaidCount, paidCount, totalAmount, unpaidAmount };
	}, [fines]);

	const fineRows = fines.map((fine) => ({
		id: fine.fine_id,
		member: fine.name,
		book: fine.title,
		amount: `₹${Number(fine.amount).toFixed(2)}`,
		paid: fine.paid,
		actions: fine.paid ? null : (
			<button
				onClick={() => handlePayFine(fine.fine_id)}
				className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:bg-emerald-100 hover:shadow-sm"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
					<path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
				</svg>
				Mark Paid
			</button>
		),
	}));

	const filterOptions = ["all", "unpaid"];

	return (
		<div className="space-y-5">
			{/* ── Page header ── */}
			<PageHeader
				title="Fines"
				subtitle="Review and collect pending fines."
			/>

			{/* ── Summary cards ── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
					<div className="flex items-start justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-600">
								<circle cx="12" cy="12" r="10" />
								<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
							</svg>
						</div>
						<div className="text-right">
							<p className="text-xs font-medium uppercase tracking-wider text-stone-400">Total Fines</p>
							<p className="mt-1 text-2xl font-bold text-stone-900">
								{loading ? "—" : stats.totalFines}
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
					<div className="flex items-start justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-rose-600">
								<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
								<path d="M12 9v4" /><path d="M12 17h.01" />
							</svg>
						</div>
						<div className="text-right">
							<p className="text-xs font-medium uppercase tracking-wider text-stone-400">Unpaid</p>
							<p className="mt-1 text-2xl font-bold text-rose-600">
								{loading ? "—" : `₹${stats.unpaidAmount.toFixed(2)}`}
							</p>
							<p className="text-[11px] text-stone-400">{loading ? "" : `${stats.unpaidCount} fines`}</p>
						</div>
					</div>
				</div>

				<div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
					<div className="flex items-start justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
								<polyline points="22 4 12 14.01 9 11.01" />
							</svg>
						</div>
						<div className="text-right">
							<p className="text-xs font-medium uppercase tracking-wider text-stone-400">Collected</p>
							<p className="mt-1 text-2xl font-bold text-emerald-600">
								{loading ? "—" : `₹${(stats.totalAmount - stats.unpaidAmount).toFixed(2)}`}
							</p>
							<p className="text-[11px] text-stone-400">{loading ? "" : `${stats.paidCount} fines`}</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── Filter bar ── */}
			<Card>
				<div>
					<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Fine Status</p>
					<div className="flex gap-1.5">
						{filterOptions.map((filter) => (
							<button
								key={filter}
								onClick={() => {
									if (filter === fineFilter) return;
									setLoading(true);
									setFineFilter(filter);
								}}
								className={[
									"rounded-lg px-3.5 py-2.5 text-xs font-medium capitalize transition-all duration-200",
									fineFilter === filter
										? "bg-slate-800 text-white shadow-sm"
										: "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50",
								].join(" ")}
							>
								{filter}
							</button>
						))}
					</div>
				</div>
			</Card>

			{/* ── Errors ── */}
			<ErrorBanner message={error} />
			<ErrorBanner message={actionError} />

			{/* ── Loading / Table ── */}
			{loading ? (
				<div className="flex items-center justify-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
					<div className="text-center">
						<svg className="mx-auto h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						<p className="mt-3 text-sm font-medium text-stone-500">Loading fines...</p>
					</div>
				</div>
			) : (
				<>
					<div className="flex items-center justify-between">
						<p className="text-xs text-stone-400">
							Showing <span className="font-semibold text-stone-600">{fines.length}</span> fines
						</p>
					</div>
					<Table headers={fineHeaders} data={fineRows} emptyText="No fines found." />
				</>
			)}
		</div>
	);
}

export default Fines;