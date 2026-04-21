import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import Table from "../components/Table.jsx";
import { createBook, deleteBook, getBooks } from "../services/bookService";

const PAGE_SIZE = 10;

/* ── Search icon ── */
const searchIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
		<path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
	</svg>
);

/* ── Table headers with custom renders ── */
const bookHeaders = [
	{
		key: "book_id",
		label: "ID",
		render: (row) => (
			<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-bold text-stone-600">
				{row.book_id}
			</span>
		),
	},
	{
		key: "title",
		label: "Title",
		render: (row) => (
			<div>
				<p className="font-semibold text-stone-800">{row.title}</p>
				<p className="mt-0.5 text-[11px] text-stone-400">{row.authors || "—"}</p>
			</div>
		),
	},
	{ key: "publisher", label: "Publisher" },
	{
		key: "available",
		label: "Availability",
		render: (row) => {
			const [avail, total] = row.available.split("/").map(Number);
			const pct = total > 0 ? (avail / total) * 100 : 0;
			const barColor = pct > 50 ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-rose-400";

			return (
				<div className="w-28">
					<div className="flex items-center justify-between text-xs">
						<span className="font-semibold text-stone-700">{avail}</span>
						<span className="text-stone-400">/ {total}</span>
					</div>
					<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
						<div
							className={["h-full rounded-full transition-all duration-500", barColor].join(" ")}
							style={{ width: `${pct}%` }}
						></div>
					</div>
				</div>
			);
		},
	},
	{ key: "actions", label: "" },
];

function Books() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [books, setBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [page, setPage] = useState(1);
	const [reloadKey, setReloadKey] = useState(0);
	const [availableFilter, setAvailableFilter] = useState("all");
	const [sortBy, setSortBy] = useState("title");
	const [sortOrder, setSortOrder] = useState("ASC");
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_SIZE,
		total_items: 0,
		total_pages: 1,
	});

	const [formData, setFormData] = useState({
		title: "",
		author: "",
		publisher: "",
		total_copies: "1",
		isbn: "",
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

		async function loadBooks() {
			try {
				const response = await getBooks({
					page,
					limit: PAGE_SIZE,
					sort: sortBy,
					order: sortOrder,
					available: availableFilter === "available" ? true : undefined,
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

				setBooks(nextItems);
				setPagination(nextPagination);
				setError("");
			} catch (requestError) {
				if (cancelled) {
					return;
				}

				setError(requestError?.response?.data?.message || "Error fetching books");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadBooks();

		return () => {
			cancelled = true;
		};
	}, [page, availableFilter, sortBy, sortOrder, reloadKey]);

	const filteredBooks = useMemo(() => {
		const keyword = searchText.trim().toLowerCase();

		if (!keyword) {
			return books;
		}

		return books.filter((book) => {
			const titleMatch = String(book.title || "").toLowerCase().includes(keyword);
			const authorMatch = Array.isArray(book.authors)
				? book.authors.join(" ").toLowerCase().includes(keyword)
				: false;
			return titleMatch || authorMatch;
		});
	}, [books, searchText]);

	async function handleCreateBook() {
		setIsSubmitting(true);
		setActionError("");

		try {
			await createBook({
				title: formData.title,
				authors: formData.author
					.split(",")
					.map((name) => name.trim())
					.filter(Boolean),
				publisher: formData.publisher || null,
				total_copies: Number(formData.total_copies),
				isbn: formData.isbn || null,
			});

			setIsModalOpen(false);
			setFormData({
				title: "",
				author: "",
				publisher: "",
				total_copies: "1",
				isbn: "",
			});

			triggerReload({ resetPage: true });
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error creating book");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteBook(bookId) {
		setActionError("");

		try {
			await deleteBook(bookId);
			triggerReload();
		} catch (requestError) {
			setActionError(requestError?.response?.data?.message || "Error deleting book");
		}
	}

	function handleSortChange(event) {
		const [nextSortBy, nextSortOrder] = event.target.value.split("|");
		setLoading(true);
		setPage(1);
		setSortBy(nextSortBy);
		setSortOrder(nextSortOrder);
	}

	function handleAvailabilityFilter(nextFilter) {
		if (nextFilter === availableFilter) {
			return;
		}

		setLoading(true);
		setPage(1);
		setAvailableFilter(nextFilter);
	}

	const totalPages = Math.max(1, Number(pagination.total_pages) || 1);

	const tableRows = filteredBooks.map((book) => ({
		id: book.book_id,
		book_id: book.book_id,
		title: book.title,
		authors: Array.isArray(book.authors) ? book.authors.join(", ") : "",
		publisher: book.publisher || "—",
		available: `${book.available_copies}/${book.total_copies}`,
		actions: (
			<button
				onClick={() => handleDeleteBook(book.book_id)}
				className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:shadow-sm"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
					<path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
				</svg>
				Delete
			</button>
		),
	}));

	return (
		<div className="space-y-5">
			{/* ── Page header ── */}
			<PageHeader
				title="Books"
				subtitle="Manage your library catalog."
				hint="Use Book ID while creating issues."
			>
				<Button onClick={() => setIsModalOpen(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="-ml-0.5 mr-1.5 h-4 w-4">
						<path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
					</svg>
					Add Book
				</Button>
			</PageHeader>

			{/* ── Filters bar ── */}
			<Card>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Input
						id="book-search"
						label="Search"
						placeholder="Search by title or author..."
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						icon={searchIcon}
					/>

					<div>
						<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Availability</p>
						<div className="flex gap-1.5">
							{["all", "available"].map((filter) => (
								<button
									key={filter}
									onClick={() => handleAvailabilityFilter(filter)}
									className={[
										"rounded-lg px-3.5 py-2.5 text-xs font-medium capitalize transition-all duration-200",
										availableFilter === filter
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
						<label htmlFor="book-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
							Sort By
						</label>
						<select
							id="book-sort"
							className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							value={`${sortBy}|${sortOrder}`}
							onChange={handleSortChange}
						>
							<option value="title|ASC">Title (A-Z)</option>
							<option value="title|DESC">Title (Z-A)</option>
							<option value="total_copies|DESC">Total Copies (High-Low)</option>
							<option value="total_copies|ASC">Total Copies (Low-High)</option>
						</select>
					</div>
				</div>
			</Card>

			{/* ── Error banners ── */}
			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-rose-500">
						<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
					</svg>
					<p className="text-sm font-medium text-rose-700">{error}</p>
				</div>
			) : null}
			{actionError ? (
				<div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-rose-500">
						<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
					</svg>
					<p className="text-sm font-medium text-rose-700">{actionError}</p>
				</div>
			) : null}

			{/* ── Loading / Table ── */}
			{loading ? (
				<div className="flex items-center justify-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
					<div className="text-center">
						<svg className="mx-auto h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						<p className="mt-3 text-sm font-medium text-stone-500">Loading books...</p>
					</div>
				</div>
			) : (
				<>
					{/* Result count */}
					<div className="flex items-center justify-between">
						<p className="text-xs text-stone-400">
							Showing <span className="font-semibold text-stone-600">{filteredBooks.length}</span> of{" "}
							<span className="font-semibold text-stone-600">{pagination.total_items}</span> books
						</p>
					</div>

					<Table headers={bookHeaders} data={tableRows} emptyText="No books found in catalog." />

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

			{/* ── Add Book Modal ── */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Add New Book"
				subtitle="Fill in the details to add a book to the catalog."
			>
				<div className="space-y-4">
					<Input
						id="book-title"
						label="Title"
						placeholder="Enter book title"
						value={formData.title}
						onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
					/>
					<Input
						id="book-author"
						label="Authors"
						placeholder="Comma separated author names"
						value={formData.author}
						onChange={(event) => setFormData((prev) => ({ ...prev, author: event.target.value }))}
					/>
					<div className="grid grid-cols-2 gap-3">
						<Input
							id="book-publisher"
							label="Publisher"
							placeholder="Enter publisher"
							value={formData.publisher}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, publisher: event.target.value }))
							}
						/>
						<Input
							id="book-total-copies"
							label="Total Copies"
							type="number"
							placeholder="Enter total copies"
							value={formData.total_copies}
							onChange={(event) =>
								setFormData((prev) => ({ ...prev, total_copies: event.target.value }))
							}
						/>
					</div>
					<Input
						id="book-isbn"
						label="ISBN"
						placeholder="Enter ISBN (optional)"
						value={formData.isbn}
						onChange={(event) => setFormData((prev) => ({ ...prev, isbn: event.target.value }))}
					/>

					{actionError ? (
						<div className="rounded-lg bg-rose-50 px-3 py-2">
							<p className="text-xs font-medium text-rose-600">{actionError}</p>
						</div>
					) : null}

					<div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
						<Button variant="secondary" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateBook} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<svg className="-ml-0.5 mr-1.5 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Saving...
								</>
							) : (
								"Save Book"
							)}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default Books;
