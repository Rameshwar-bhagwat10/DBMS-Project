/**
 * Pagination — Clean pagination bar with page info and nav buttons.
 */
function Pagination({ page, totalPages, onPrev, onNext, loading }) {
	return (
		<div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white px-5 py-3 shadow-sm ring-1 ring-stone-200/60">
			<p className="text-xs font-medium text-stone-400">
				Page <span className="font-bold text-stone-700">{page}</span> of{" "}
				<span className="font-bold text-stone-700">{totalPages}</span>
			</p>
			<div className="flex items-center gap-1.5">
				<button
					disabled={page <= 1 || loading}
					onClick={onPrev}
					className={[
						"inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium",
						"transition-all duration-200",
						page <= 1
							? "cursor-not-allowed text-stone-300"
							: "text-stone-600 hover:bg-stone-50 hover:shadow-sm",
					].join(" ")}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
						<path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
					</svg>
					Previous
				</button>
				<button
					disabled={page >= totalPages || loading}
					onClick={onNext}
					className={[
						"inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium",
						"transition-all duration-200",
						page >= totalPages
							? "cursor-not-allowed text-stone-300"
							: "text-stone-600 hover:bg-stone-50 hover:shadow-sm",
					].join(" ")}
				>
					Next
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
						<path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	);
}

export default Pagination;
