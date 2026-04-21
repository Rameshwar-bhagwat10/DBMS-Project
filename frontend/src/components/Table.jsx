function Table({ headers = [], data = [], emptyText = "No records available." }) {
	return (
		<div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-200/60">
			<div className="overflow-x-auto">
				<table className="min-w-full text-left text-sm">
					<thead>
						<tr className="border-b border-stone-100 bg-stone-50/80">
							{headers.map((header) => (
								<th
									key={header.key}
									scope="col"
									className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-stone-400"
								>
									{header.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-stone-100/80">
						{data.length === 0 ? (
							<tr>
								<td colSpan={headers.length} className="px-5 py-12 text-center">
									<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-stone-400">
											<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
										</svg>
									</div>
									<p className="text-sm font-medium text-stone-500">{emptyText}</p>
								</td>
							</tr>
						) : (
							data.map((row, rowIndex) => (
								<tr
									key={row.id ?? rowIndex}
									className="transition-colors duration-150 hover:bg-stone-50/60"
								>
									{headers.map((header) => (
										<td
											key={`${row.id ?? rowIndex}-${header.key}`}
											className="px-5 py-3.5 text-stone-700"
										>
											{typeof header.render === "function"
												? header.render(row)
												: row[header.key]}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Table;
