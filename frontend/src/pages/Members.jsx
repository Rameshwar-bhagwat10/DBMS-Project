import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import Table from "../components/Table.jsx";
import {
	createMember,
	deleteMember,
	getMembers,
	updateMember,
} from "../services/memberService";

const PAGE_SIZE = 10;

/* ── Search icon ── */
const searchIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
		<path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
	</svg>
);

/* ── Table headers with custom renders ── */
const memberHeaders = [
	{
		key: "member_id",
		label: "ID",
		render: (row) => (
			<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-600">
				{row.member_id}
			</span>
		),
	},
	{
		key: "name",
		label: "Member",
		render: (row) => (
			<div className="flex items-center gap-3">
				{/* Avatar circle */}
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white shadow-sm">
					{(row.name || "?").charAt(0).toUpperCase()}
				</div>
				<div>
					<p className="font-semibold text-stone-800">{row.name}</p>
					<p className="mt-0.5 text-[11px] text-stone-400">{row.email}</p>
				</div>
			</div>
		),
	},
	{
		key: "phone",
		label: "Phone",
		render: (row) => (
			<div className="flex items-center gap-1.5 text-stone-600">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-stone-400">
					<path fillRule="evenodd" d="m3.855 7.286 1.067-.534a1 1 0 0 0 .542-1.046l-.44-2.858A1 1 0 0 0 4.036 2H3a1 1 0 0 0-1 1v2c0 .709.082 1.4.238 2.062a9.012 9.012 0 0 0 6.7 6.7A9.024 9.024 0 0 0 11 14h2a1 1 0 0 0 1-1v-1.036a1 1 0 0 0-.848-.988l-2.858-.44a1 1 0 0 0-1.046.542l-.534 1.067a7.52 7.52 0 0 1-4.86-4.859Z" clipRule="evenodd" />
				</svg>
				<span className="text-sm">{row.phone}</span>
			</div>
		),
	},
	{
		key: "membership_date",
		label: "Joined",
		render: (row) => (
			<div className="flex items-center gap-1.5">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-stone-400">
					<path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 7a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-7Z" clipRule="evenodd" />
				</svg>
				<span className="text-sm text-stone-600">{row.membership_date}</span>
			</div>
		),
	},
	{ key: "actions", label: "" },
];

/* ── Spinner component ── */
function Spinner() {
	return (
		<svg className="-ml-0.5 mr-1.5 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
		</svg>
	);
}

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

function Members() {
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [page, setPage] = useState(1);
	const [reloadKey, setReloadKey] = useState(0);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_SIZE,
		total_items: 0,
		total_pages: 1,
	});

	const [addForm, setAddForm] = useState({ name: "", email: "", phone: "" });
	const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

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

		async function loadMembers() {
			try {
				const response = await getMembers({ page, limit: PAGE_SIZE });
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

				setMembers(nextItems);
				setPagination(nextPagination);
				setError("");
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error fetching members");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadMembers();

		return () => {
			cancelled = true;
		};
	}, [page, reloadKey]);

	async function handleAddMember() {
		setIsSubmitting(true);
		setActionError("");

		try {
			await createMember(addForm);
			setIsAddModalOpen(false);
			setAddForm({ name: "", email: "", phone: "" });
			triggerReload({ resetPage: true });
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error creating member");
		} finally {
			setIsSubmitting(false);
		}
	}

	function openEditModal(member) {
		setSelectedMember(member);
		setEditForm({
			name: member.name || "",
			email: member.email || "",
			phone: member.phone || "",
		});
		setActionError("");
		setIsEditModalOpen(true);
	}

	async function handleUpdateMember() {
		if (!selectedMember) {
			return;
		}

		setIsSubmitting(true);
		setActionError("");

		try {
			await updateMember(selectedMember.member_id, editForm);
			setIsEditModalOpen(false);
			setSelectedMember(null);
			triggerReload();
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error updating member");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteMember(memberId) {
		setActionError("");

		try {
			await deleteMember(memberId);
			triggerReload();
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error deleting member");
		}
	}

	const filteredMembers = useMemo(() => {
		const keyword = searchText.trim().toLowerCase();

		if (!keyword) {
			return members;
		}

		return members.filter((member) => {
			const nameMatch = String(member.name || "").toLowerCase().includes(keyword);
			const emailMatch = String(member.email || "").toLowerCase().includes(keyword);
			return nameMatch || emailMatch;
		});
	}, [members, searchText]);

	const totalPages = Math.max(1, Number(pagination.total_pages) || 1);

	const memberRows = filteredMembers.map((member) => ({
		id: member.member_id,
		member_id: member.member_id,
		name: member.name,
		email: member.email,
		phone: member.phone || "—",
		membership_date: member.membership_date
			? new Date(member.membership_date).toLocaleDateString("en-IN", {
					day: "numeric",
					month: "short",
					year: "numeric",
			  })
			: "—",
		actions: (
			<div className="flex items-center gap-1.5">
				{/* Edit button */}
				<button
					onClick={() => openEditModal(member)}
					className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-all duration-200 hover:bg-stone-50 hover:shadow-sm"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
						<path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
						<path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
					</svg>
					Edit
				</button>
				{/* Delete button */}
				<button
					onClick={() => handleDeleteMember(member.member_id)}
					className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:shadow-sm"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
						<path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
					</svg>
					Delete
				</button>
			</div>
		),
	}));

	return (
		<div className="space-y-5">
			{/* ── Page header ── */}
			<PageHeader
				title="Members"
				subtitle="Track all library members in one place."
				hint="Use Member ID while creating issues."
			>
				<Button onClick={() => setIsAddModalOpen(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="-ml-0.5 mr-1.5 h-4 w-4">
						<path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
					</svg>
					Add Member
				</Button>
			</PageHeader>

			{/* ── Search bar ── */}
			<Card>
				<div className="max-w-md">
					<Input
						id="member-search"
						label="Search"
						placeholder="Search by name or email..."
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						icon={searchIcon}
					/>
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
						<p className="mt-3 text-sm font-medium text-stone-500">Loading members...</p>
					</div>
				</div>
			) : (
				<>
					{/* Result count */}
					<div className="flex items-center justify-between">
						<p className="text-xs text-stone-400">
							Showing <span className="font-semibold text-stone-600">{filteredMembers.length}</span> of{" "}
							<span className="font-semibold text-stone-600">{pagination.total_items}</span> members
						</p>
					</div>

					<Table headers={memberHeaders} data={memberRows} emptyText="No members found." />

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

			{/* ── Add Member Modal ── */}
			<Modal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				title="Add New Member"
				subtitle="Register a new library member."
			>
				<div className="space-y-4">
					<Input
						id="member-name"
						label="Full Name"
						placeholder="Enter member name"
						value={addForm.name}
						onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))}
					/>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							id="member-email"
							label="Email"
							type="email"
							placeholder="Enter email address"
							value={addForm.email}
							onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))}
						/>
						<Input
							id="member-phone"
							label="Phone"
							placeholder="Enter phone number"
							value={addForm.phone}
							onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))}
						/>
					</div>

					{actionError ? (
						<div className="rounded-lg bg-rose-50 px-3 py-2">
							<p className="text-xs font-medium text-rose-600">{actionError}</p>
						</div>
					) : null}

					<div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
						<Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleAddMember} disabled={isSubmitting}>
							{isSubmitting ? <><Spinner />Saving...</> : "Save Member"}
						</Button>
					</div>
				</div>
			</Modal>

			{/* ── Edit Member Modal ── */}
			<Modal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				title="Edit Member"
				subtitle={selectedMember ? `Editing member #${selectedMember.member_id}` : ""}
			>
				<div className="space-y-4">
					<Input
						id="member-edit-name"
						label="Full Name"
						placeholder="Enter member name"
						value={editForm.name}
						onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
					/>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							id="member-edit-email"
							label="Email"
							type="email"
							placeholder="Enter email address"
							value={editForm.email}
							onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
						/>
						<Input
							id="member-edit-phone"
							label="Phone"
							placeholder="Enter phone number"
							value={editForm.phone}
							onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
						/>
					</div>

					{actionError ? (
						<div className="rounded-lg bg-rose-50 px-3 py-2">
							<p className="text-xs font-medium text-rose-600">{actionError}</p>
						</div>
					) : null}

					<div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
						<Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateMember} disabled={isSubmitting}>
							{isSubmitting ? <><Spinner />Updating...</> : "Update Member"}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default Members;
