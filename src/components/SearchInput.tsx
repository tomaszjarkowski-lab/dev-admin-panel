type SearchInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

export function SearchInput({
	value,
	onChange,
	placeholder = "Szukaj…",
	className = "",
}: SearchInputProps) {
	return (
		<div className={`relative ${className}`}>
			<svg
				className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
				/>
			</svg>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="w-full rounded-lg border border-border bg-white py-2 pr-3 pl-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
			/>
		</div>
	);
}
