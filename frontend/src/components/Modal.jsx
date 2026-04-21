function Modal({ isOpen, onClose, title, subtitle, children }) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
				onClick={onClose}
			></div>

			{/* Modal panel */}
			<div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-slate-900/20">
				{/* Header */}
				<div className="flex items-start justify-between border-b border-stone-100 px-6 py-4">
					<div>
						<h2 className="text-lg font-bold text-stone-900">{title}</h2>
						{subtitle ? (
							<p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>
						) : null}
					</div>
					<button
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
							<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5">{children}</div>
			</div>
		</div>
	);
}

export default Modal;
