import { useAuth } from "@/auth/AuthContext";

type TopbarProps = {
	onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
	const { session } = useAuth();

	return (
		<header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
			<button
				type="button"
				onClick={onMenuClick}
				className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
				aria-label="Otwórz menu"
			>
				<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			<div className="hidden text-sm text-gray-500 lg:block">
				Panel administracyjny
			</div>

			<span className="ml-auto max-w-[240px] truncate text-sm text-gray-700 sm:max-w-none">
				{session?.email}
			</span>
		</header>
	);
}
