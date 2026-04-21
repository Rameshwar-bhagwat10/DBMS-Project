const variantClasses = {
	primary:
		"bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-400 shadow-sm shadow-slate-800/20",
	secondary:
		"bg-stone-100 text-stone-700 hover:bg-stone-200 focus-visible:ring-stone-300 border border-stone-200",
	danger:
		"bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-300 shadow-sm shadow-rose-500/20",
	success:
		"bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300 shadow-sm shadow-emerald-600/20",
};

function Button({
	children,
	onClick,
	type = "button",
	variant = "primary",
	disabled = false,
	className = "",
}) {
	const variantClass = variantClasses[variant] || variantClasses.primary;

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={[
				"inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
				"transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				variantClass,
				className,
			].join(" ")}
		>
			{children}
		</button>
	);
}

export default Button;
