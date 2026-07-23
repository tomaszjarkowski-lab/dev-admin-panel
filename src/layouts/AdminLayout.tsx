import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layouts/Sidebar";
import { Topbar } from "@/layouts/Topbar";

export function AdminLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex min-h-screen bg-surface">
			<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar onMenuClick={() => setSidebarOpen(true)} />
				<main className="flex-1 overflow-auto p-4 lg:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
