import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDoctorOpinions } from "@/api/doctorOpinions";
import { ForbiddenError } from "@/api/client";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import type { DoctorOpinion } from "@/types";

export function DoctorOpinionsPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<DoctorOpinion[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchDoctorOpinions();
			setItems(data);
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(err instanceof Error ? err.message : "Nie udało się pobrać opinii.");
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
				<h1 className="text-2xl font-semibold text-gray-900">Opinie lekarza</h1>
				<p className="mt-1 text-sm text-gray-500">
					Statusy wymagań i wypełnienia opinii
				</p>
			</div>

			{loading ? (
				<TableSkeleton rows={6} />
			) : error ? (
				<ErrorState message={error} onRetry={load} />
			) : items.length === 0 ? (
				<EmptyState title="Brak opinii lekarza" />
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{items.map((item) => (
						<article
							key={item.id}
							className="rounded-xl border border-border bg-white p-5 shadow-sm"
						>
							<div className="flex flex-wrap gap-2">
								<Badge variant={item.requiresDoctorOpinion ? "warning" : "neutral"}>
									requires: {String(item.requiresDoctorOpinion)}
								</Badge>
								<Badge variant={item.isOpinionFormCompleted ? "success" : "neutral"}>
									form: {String(item.isOpinionFormCompleted)}
								</Badge>
								<Badge
									variant={item.isDoctorOpinionSubmitted ? "success" : "neutral"}
								>
									submitted: {String(item.isDoctorOpinionSubmitted)}
								</Badge>
							</div>

							<dl className="mt-4 space-y-2 text-sm">
								<div>
									<dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
										MedChart event
									</dt>
									<dd className="mt-0.5 font-mono text-xs break-all text-gray-800">
										{item.medChartEventId || "—"}
									</dd>
								</div>
								<div>
									<dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
										User ID
									</dt>
									<dd className="mt-0.5 font-mono text-xs break-all text-gray-800">
										{item.userId}
									</dd>
								</div>
								<div>
									<dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
										Analysis ID
									</dt>
									<dd className="mt-0.5">
										<Link
											to={`/analysis-results/${item.analysisResultId}`}
											className="font-mono text-xs text-primary-dark hover:underline"
										>
											{item.analysisResultId}
										</Link>
									</dd>
								</div>
							</dl>
						</article>
					))}
				</div>
			)}
		</div>
	);
}
