const variantClasses = {
	success: "bg-emerald-50 text-emerald-700 border-emerald-200",
	danger: "bg-rose-50 text-rose-700 border-rose-200",
	warning: "bg-amber-50 text-amber-700 border-amber-200",
	info: "bg-sky-50 text-sky-700 border-sky-200",
	neutral: "bg-stone-100 text-stone-600 border-stone-200",
};

const dotClasses = {
	success: "bg-emerald-500",
	danger: "bg-rose-500",
	warning: "bg-amber-500",
	info: "bg-sky-500",
	neutral: "bg-stone-400",
};

function Badge({ children, variant = "success" }) {
	const classes = variantClasses[variant] || variantClasses.success;
	const dot = dotClasses[variant] || dotClasses.success;

	return (
		<span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", classes].join(" ")}>
			<span className={["inline-block h-1.5 w-1.5 rounded-full", dot].join(" ")}></span>
			{children}
		</span>
	);
}

export default Badge;
