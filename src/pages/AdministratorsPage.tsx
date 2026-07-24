import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
	createAdmin,
	deleteAdmin,
	getUsersAdmin,
} from "@/api/users";
import { ApiError, ForbiddenError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
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

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function shortenId(value: string | null): string {
	if (!value) return "—";
	if (value.length <= 12) return value;
	return `${value.slice(0, 8)}…`;
}

export function AdministratorsPage() {
	const { session, isRootAdmin } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<User[]>([]);
	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "root_admin">(
		"all",
	);

	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getUsersAdmin();
			setItems(
				data.filter(
					(user) => user.role === "admin" || user.role === "root_admin",
				),
			);
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(
					err instanceof Error
						? err.message
						: "Nie udało się pobrać administratorów.",
				);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return items.filter((user) => {
			const roleOk = roleFilter === "all" || user.role === roleFilter;
			const queryOk = !q || user.email.toLowerCase().includes(q);
			return roleOk && queryOk;
		});
	}, [items, query, roleFilter]);

	const canSubmit = isValidEmail(email.trim()) && !submitting;

	async function handleCreate(event: FormEvent) {
		event.preventDefault();
		if (!canSubmit || !isRootAdmin) return;

		setSubmitting(true);
		setFormError(null);
		setFormSuccess(null);
		setActionError(null);

		try {
			await createAdmin(email.trim());
			setFormSuccess("Admin dodany / zaktualizowany");
			setEmail("");
			await load();
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setFormError(err.message);
			} else if (err instanceof ApiError && err.status === 400) {
				setFormError(err.message || "Nieprawidłowy e-mail lub operacja niedozwolona.");
			} else if (err instanceof ApiError && err.status === 401) {
				setFormError("Sesja wygasła. Zaloguj się ponownie.");
			} else {
				setFormError(
					err instanceof Error ? err.message : "Nie udało się dodać admina.",
				);
			}
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(user: User) {
		if (!isRootAdmin) return;
		const confirmed = window.confirm(
			`Na pewno usunąć admina ${user.email}?`,
		);
		if (!confirmed) return;

		setDeletingId(user.id);
		setActionError(null);
		setFormSuccess(null);

		try {
			await deleteAdmin(user.id);
			await load();
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setActionError(err.message);
			} else if (err instanceof ApiError && err.status === 404) {
				setActionError("Nie znaleziono użytkownika.");
				await load();
			} else if (err instanceof ApiError && err.status === 400) {
				setActionError(err.message || "Nie można usunąć tego użytkownika.");
			} else {
				setActionError(
					err instanceof Error ? err.message : "Nie udało się usunąć admina.",
				);
			}
		} finally {
			setDeletingId(null);
		}
	}

	function canDelete(user: User): boolean {
		if (!isRootAdmin) return false;
		if (user.role !== "admin") return false;
		if (session?.userId && user.id === session.userId) return false;
		if (
			session?.email &&
			user.email.toLowerCase() === session.email.toLowerCase()
		) {
			return false;
		}
		return true;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						Administratorzy
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Użytkownicy z rolą admin lub root_admin
						{!isRootAdmin
							? " · tryb tylko do odczytu"
							: " · zarządzanie dostępne dla root_admin"}
					</p>
				</div>
				<div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
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
					<SearchInput
						value={query}
						onChange={setQuery}
						placeholder="Szukaj po e-mailu…"
						className="w-full sm:w-72"
					/>
				</div>
			</div>

			{isRootAdmin ? (
				<section className="rounded-xl border border-border bg-white p-5 shadow-sm">
					<h2 className="text-base font-semibold text-gray-900">Dodaj admina</h2>
					<p className="mt-1 text-sm text-gray-500">
						Utwórz nowe konto admina albo wypromuj istniejącego patienta.
					</p>

					<form
						onSubmit={handleCreate}
						className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
					>
						<label className="block flex-1 text-sm font-medium text-gray-700">
							<span className="mb-1.5 block">E-mail</span>
							<input
								type="email"
								value={email}
								onChange={(event) => {
									setEmail(event.target.value);
									if (formError) setFormError(null);
									if (formSuccess) setFormSuccess(null);
								}}
								placeholder="admin@example.com"
								disabled={submitting}
								className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
							/>
						</label>
						<button
							type="submit"
							disabled={!canSubmit}
							className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-55"
						>
							{submitting ? "Dodawanie…" : "Dodaj admina"}
						</button>
					</form>

					{formSuccess ? (
						<div className="mt-3 rounded-lg border border-primary/30 bg-primary-light px-3 py-2 text-sm text-primary-dark">
							{formSuccess}
						</div>
					) : null}
					{formError ? (
						<div
							className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
							role="alert"
						>
							{formError}
						</div>
					) : null}
				</section>
			) : null}

			{actionError ? (
				<div
					className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
					role="alert"
				>
					{actionError}
				</div>
			) : null}

			{loading ? (
				<TableSkeleton rows={8} />
			) : error ? (
				<ErrorState message={error} onRetry={load} />
			) : filtered.length === 0 ? (
				<EmptyState
					title="Brak administratorów"
					description={
						query || roleFilter !== "all"
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
								<th className="px-4 py-3">Auth User ID</th>
								{isRootAdmin ? (
									<th className="px-4 py-3 text-right">Akcje</th>
								) : null}
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
									<td
										className="px-4 py-3 font-mono text-xs text-gray-600"
										title={user.authUserId ?? undefined}
									>
										{shortenId(user.authUserId)}
									</td>
									{isRootAdmin ? (
										<td className="px-4 py-3 text-right">
											{canDelete(user) ? (
												<button
													type="button"
													onClick={() => void handleDelete(user)}
													disabled={deletingId === user.id}
													className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
												>
													{deletingId === user.id ? "Usuwanie…" : "Usuń"}
												</button>
											) : (
												<span className="text-xs text-gray-400">—</span>
											)}
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
