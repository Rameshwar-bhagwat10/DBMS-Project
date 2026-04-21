/**
 * PageHeader — Consistent page header with title, subtitle, optional hint, and action slot.
 */
function PageHeader({ title, subtitle, hint, children }) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h2 className="text-2xl font-bold text-stone-900">{title}</h2>
				{subtitle ? (
					<p className="mt-1 text-sm text-stone-500">{subtitle}</p>
				) : null}
				{hint ? (
					<div className="mt-1.5 flex items-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-amber-500">
							<path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
						</svg>
						<p className="text-xs font-medium text-amber-600">{hint}</p>
					</div>
				) : null}
			</div>
			{children ? <div className="flex items-center gap-2">{children}</div> : null}
		</div>
	);
}

export default PageHeader;
