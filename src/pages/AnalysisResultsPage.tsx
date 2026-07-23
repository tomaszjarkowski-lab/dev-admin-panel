import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAnalysisResults } from "@/api/analysisResults";
import { fetchUsers } from "@/api/users";
import { ForbiddenError } from "@/api/client";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { SearchInput } from "@/components/SearchInput";
import type { AnalysisResult, User } from "@/types";
import {
	formatConfidence,
	formatFileSize,
	getTopPrediction,
} from "@/utils/format";

export function AnalysisResultsPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<AnalysisResult[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [query, setQuery] = useState("");

	const userEmailById = useMemo(() => {
		const map = new Map<string, string>();
		for (const user of users) {
			map.set(user.id, user.email);
		}
		return map;
	}, [users]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [analyses, usersData] = await Promise.all([
				fetchAnalysisResults(),
				fetchUsers().catch(() => [] as User[]),
			]);
			setItems(analyses);
			setUsers(usersData);
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(err instanceof Error ? err.message : "Nie udało się pobrać analiz.");
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
		if (!q) return items;
		return items.filter((item) => {
			const email = userEmailById.get(item.userId)?.toLowerCase() ?? "";
			return (
				item.name.toLowerCase().includes(q) ||
				item.userId.toLowerCase().includes(q) ||
				email.includes(q)
			);
		});
	}, [items, query, userEmailById]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Analizy</h1>
					<p className="mt-1 text-sm text-gray-500">
						Wszystkie wyniki analiz AI
					</p>
				</div>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder="Szukaj po nazwie, userId, e-mailu…"
					className="w-full sm:w-80"
				/>
			</div>

			{loading ? (
				<TableSkeleton rows={8} />
			) : error ? (
				<ErrorState message={error} onRetry={load} />
			) : filtered.length === 0 ? (
				<EmptyState
					title="Brak wyników"
					description={
						query
							? "Żadna analiza nie pasuje do wyszukiwania."
							: "Nie ma jeszcze żadnych analiz."
					}
				/>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-white">
					<table className="min-w-full divide-y divide-border text-sm">
						<thead className="bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
							<tr>
								<th className="px-4 py-3">Nazwa</th>
								<th className="px-4 py-3">Użytkownik</th>
								<th className="px-4 py-3">Plik</th>
								<th className="px-4 py-3">Purchase</th>
								<th className="px-4 py-3">Doctor opinion</th>
								<th className="px-4 py-3">Top diagnosis</th>
								<th className="px-4 py-3">Confidence</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filtered.map((item) => {
								const top = getTopPrediction(item.analysisResultJson);
								const email = userEmailById.get(item.userId);
								return (
									<tr
										key={item.id}
										onClick={() => navigate(`/analysis-results/${item.id}`)}
										className="cursor-pointer hover:bg-primary-light/40"
									>
										<td className="px-4 py-3 font-medium text-gray-900">
											{item.name}
										</td>
										<td className="px-4 py-3">
											<div className="text-gray-800">{email ?? "—"}</div>
											<div className="font-mono text-xs text-gray-500">
												{item.userId}
											</div>
										</td>
										<td className="px-4 py-3 text-gray-700">
											{item.fileType} · {formatFileSize(item.fileSize)}
										</td>
										<td className="px-4 py-3">
											<Badge variant={item.purchase || item.purchaseId ? "success" : "neutral"}>
												{item.purchase || item.purchaseId ? "Tak" : "Nie"}
											</Badge>
										</td>
										<td className="px-4 py-3">
											<Badge
												variant={
													item.doctorOpinion || item.doctorOpinionId
														? "primary"
														: "neutral"
												}
											>
												{item.doctorOpinion || item.doctorOpinionId ? "Tak" : "Nie"}
											</Badge>
										</td>
										<td className="px-4 py-3 text-gray-700">
											{top?.name ?? "—"}
										</td>
										<td className="px-4 py-3 text-gray-700">
											{formatConfidence(top?.confidence)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
