import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchUsers } from "@/api/users";
import { ForbiddenError } from "@/api/client";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { SearchInput } from "@/components/SearchInput";
import type { User, UserRole } from "@/types";

const roleBadgeVariant: Record<UserRole, "patient" | "admin" | "root_admin"> = {
	patient: "patient",
	admin: "admin",
	root_admin: "root_admin",
};

type UsersListMode = "patients" | "administrators";

const ROLES_BY_MODE: Record<UsersListMode, UserRole[]> = {
	patients: ["patient"],
	administrators: ["admin", "root_admin"],
};

type UsersListPageProps = {
	mode: UsersListMode;
	title: string;
	description: string;
	emptyTitle: string;
};

export function UsersListPage({
	mode,
	title,
	description,
	emptyTitle,
}: UsersListPageProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<User[]>([]);
	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "root_admin">(
		"all",
	);

	const showAdminRoleFilter = mode === "administrators";
	const roles = ROLES_BY_MODE[mode];

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchUsers();
			setItems(data.filter((user) => roles.includes(user.role)));
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(
					err instanceof Error
						? err.message
						: "Nie udało się pobrać użytkowników.",
				);
			}
		} finally {
			setLoading(false);
		}
	}, [roles]);

	useEffect(() => {
		void load();
	}, [load]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return items.filter((user) => {
			const roleOk =
				!showAdminRoleFilter ||
				roleFilter === "all" ||
				user.role === roleFilter;
			const queryOk = !q || user.email.toLowerCase().includes(q);
			return roleOk && queryOk;
		});
	}, [items, query, roleFilter, showAdminRoleFilter]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
					<p className="mt-1 text-sm text-gray-500">{description}</p>
				</div>
				<div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
					{showAdminRoleFilter ? (
						<select
							value={roleFilter}
							onChange={(event) =>
								setRoleFilter(
									event.target.value as "all" | "admin" | "root_admin",
								)
							}
							className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
						>
							<option value="all">Wszystkie role</option>
							<option value="admin">admin</option>
							<option value="root_admin">root_admin</option>
						</select>
					) : null}
					<SearchInput
						value={query}
						onChange={setQuery}
						placeholder="Szukaj po e-mailu…"
						className="w-full sm:w-72"
					/>
				</div>
			</div>

			{loading ? (
				<TableSkeleton rows={8} />
			) : error ? (
				<ErrorState message={error} onRetry={load} />
			) : filtered.length === 0 ? (
				<EmptyState
					title={emptyTitle}
					description={
						query || (showAdminRoleFilter && roleFilter !== "all")
							? "Żaden użytkownik nie pasuje do filtrów."
							: undefined
					}
				/>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-white">
					<table className="min-w-full divide-y divide-border text-sm">
						<thead className="bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
							<tr>
								<th className="px-4 py-3">E-mail</th>
								<th className="px-4 py-3">Rola</th>
								<th className="px-4 py-3">ID</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filtered.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 font-medium text-gray-900">
										{user.email}
									</td>
									<td className="px-4 py-3">
										<Badge variant={roleBadgeVariant[user.role]}>
											{user.role}
										</Badge>
									</td>
									<td className="px-4 py-3 font-mono text-xs text-gray-600">
										{user.id}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
