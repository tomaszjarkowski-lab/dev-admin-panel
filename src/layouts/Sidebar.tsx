import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { MedMetrixLogo } from "@/components/MedMetrixLogo";
import type { ReactNode } from "react";

type NavItem = {
	to: string;
	label: string;
	icon: ReactNode;
};

const iconClass = "h-5 w-5 shrink-0";

const navItems: NavItem[] = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm10-3a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
			</svg>
		),
	},
	{
		to: "/analysis-results",
		label: "Analizy",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
			</svg>
		),
	},
	{
		to: "/purchases",
		label: "Płatności",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h.01M11 15h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
			</svg>
		),
	},
	{
		to: "/doctor-opinions",
		label: "Opinie lekarza",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6M8 4h8l1 3H7l1-3zM6 7h12v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
			</svg>
		),
	},
	{
		to: "/patients",
		label: "Pacjenci",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		),
	},
	{
		to: "/administrators",
		label: "Administratorzy",
		icon: (
			<svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
			</svg>
		),
	},
];

type SidebarProps = {
	open: boolean;
	onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
	const { logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		onClose();
		navigate("/login", { replace: true });
	};

	return (
		<>
			{open ? (
				<button
					type="button"
					aria-label="Zamknij menu"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={onClose}
				/>
			) : null}

			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform lg:static lg:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-center border-b border-border px-4 py-5">
					<MedMetrixLogo size="xl" />
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto p-3">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							onClick={onClose}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
									isActive
										? "bg-primary-light text-primary-dark"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								}`
							}
						>
							{item.icon}
							<span>{item.label}</span>
						</NavLink>
					))}
				</nav>

				<div className="border-t border-border p-3">
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
					>
						<svg
							className={iconClass}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.75}
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						<span>Wyloguj</span>
					</button>
				</div>
			</aside>
		</>
	);
}
