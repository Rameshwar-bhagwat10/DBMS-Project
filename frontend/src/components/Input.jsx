function Input({
	label,
	id,
	type = "text",
	placeholder = "",
	value,
	onChange,
	error,
	className = "",
	icon,
}) {
	return (
		<div className={className}>
			{label ? (
				<label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
					{label}
				</label>
			) : null}
			<div className="relative">
				{icon ? (
					<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
						{icon}
					</span>
				) : null}
				<input
					id={id}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className={[
						"w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400",
						"transition-all duration-200",
						"focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
						error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-stone-200",
						icon ? "pl-10" : "",
					].join(" ")}
				/>
			</div>
			{error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
		</div>
	);
}

export default Input;
