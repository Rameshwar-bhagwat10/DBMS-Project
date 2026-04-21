function Card({ title, subtitle, children, className = "" }) {
	return (
		<section
			className={[
				"rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-200/60",
				className,
			].join(" ")}
		>
			{title ? (
				<div className="mb-4">
					<h3 className="text-sm font-semibold text-stone-800">{title}</h3>
					{subtitle ? <p className="mt-0.5 text-[11px] text-stone-400">{subtitle}</p> : null}
				</div>
			) : null}
			{children}
		</section>
	);
}

export default Card;
