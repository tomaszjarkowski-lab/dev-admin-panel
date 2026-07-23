import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnalysisResults } from "@/api/analysisResults";
import { fetchDoctorOpinions } from "@/api/doctorOpinions";
import { fetchPurchases } from "@/api/purchases";
import { fetchUsers } from "@/api/users";
import { ForbiddenError } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { KpiCard, KpiCardSkeleton } from "@/components/KpiCard";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import type { AnalysisResult } from "@/types";
import { formatConfidence, getTopPrediction } from "@/utils/format";

export function DashboardPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [counts, setCounts] = useState({
		analyses: 0,
		purchases: 0,
		opinions: 0,
		users: 0,
	});
	const [recent, setRecent] = useState<AnalysisResult[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [analyses, purchases, opinions, users] = await Promise.all([
				fetchAnalysisResults(),
				fetchPurchases(),
				fetchDoctorOpinions(),
				fetchUsers(),
			]);
			setCounts({
				analyses: analyses.length,
				purchases: purchases.length,
				opinions: opinions.length,
				users: users.length,
			});
			setRecent(analyses.slice(0, 5));
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(err instanceof Error ? err.message : "Nie udało się załadować dashboardu.");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
				<p className="mt-1 text-sm text-gray-500">
					Przegląd danych Medmetrix Admin
				</p>
			</div>

			{error ? <ErrorState message={error} onRetry={load} /> : null}

			{loading ? (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<KpiCardSkeleton key={index} />
					))}
				</div>
			) : !error ? (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<KpiCard label="Analizy" value={counts.analyses} />
					<KpiCard label="Płatności" value={counts.purchases} />
					<KpiCard label="Opinie lekarza" value={counts.opinions} />
					<KpiCard label="Użytkownicy" value={counts.users} />
				</div>
			) : null}

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900">
						Ostatnie analizy
					</h2>
					<Link
						to="/analysis-results"
						className="text-sm font-medium text-primary-dark hover:underline"
					>
						Zobacz wszystkie
					</Link>
				</div>

				{loading ? (
					<TableSkeleton rows={5} />
				) : error ? null : recent.length === 0 ? (
					<EmptyState title="Brak analiz" description="Nie ma jeszcze żadnych wyników." />
				) : (
					<div className="overflow-hidden rounded-xl border border-border bg-white">
						<table className="min-w-full divide-y divide-border text-sm">
							<thead className="bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
								<tr>
									<th className="px-4 py-3">Nazwa</th>
									<th className="px-4 py-3">User ID</th>
									<th className="px-4 py-3">Top prediction</th>
									<th className="px-4 py-3">Confidence</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{recent.map((item) => {
									const top = getTopPrediction(item.analysisResultJson);
									return (
										<tr key={item.id} className="hover:bg-gray-50">
											<td className="px-4 py-3">
												<Link
													to={`/analysis-results/${item.id}`}
													className="font-medium text-primary-dark hover:underline"
												>
													{item.name}
												</Link>
											</td>
											<td className="px-4 py-3 font-mono text-xs text-gray-600">
												{item.userId}
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
			</section>
		</div>
	);
}
