import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAnalysisResults } from "@/api/analysisResults";
import { ForbiddenError } from "@/api/client";
import { Badge } from "@/components/Badge";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/LoadingSkeleton";
import type { AnalysisResult } from "@/types";
import {
	asAnalysisJson,
	formatAmount,
	formatConfidence,
	formatDate,
	formatFileSize,
} from "@/utils/format";

export function AnalysisResultDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [item, setItem] = useState<AnalysisResult | null>(null);

	const load = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setError(null);
		try {
			const analyses = await fetchAnalysisResults();
			const found = analyses.find((analysis) => analysis.id === id) ?? null;
			if (!found) {
				setError("Nie znaleziono analizy o podanym ID.");
				setItem(null);
			} else {
				setItem(found);
			}
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(
					err instanceof Error ? err.message : "Nie udało się pobrać szczegółów.",
				);
			}
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void load();
	}, [load]);

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<Link
					to="/analysis-results"
					className="text-sm text-primary-dark hover:underline"
				>
					← Wróć do listy
				</Link>
				<ErrorState message={error} onRetry={load} />
			</div>
		);
	}

	if (!item) return null;

	const json = asAnalysisJson(item.analysisResultJson);
	const topPredictions = [...(json?.ResponseMessage?.predictions ?? [])].sort(
		(a, b) => b.confidence - a.confidence,
	);
	const detailPredictions = json?.Details?.Predictions ?? [];
	const photoUrl = json?.Details?.PhotoUrl;

	return (
		<div className="space-y-6">
			<div>
				<Link
					to="/analysis-results"
					className="text-sm text-primary-dark hover:underline"
				>
					← Wróć do listy
				</Link>
				<h1 className="mt-2 text-2xl font-semibold text-gray-900">{item.name}</h1>
				<p className="mt-1 font-mono text-xs text-gray-500">{item.id}</p>
			</div>

			<section className="grid gap-4 rounded-xl border border-border bg-white p-5 lg:grid-cols-2">
				<div className="space-y-2 text-sm">
					<InfoRow label="User ID" value={item.userId} mono />
					<InfoRow label="Asset ID" value={item.assetId} mono />
					<InfoRow label="File type" value={item.fileType} />
					<InfoRow label="File size" value={formatFileSize(item.fileSize)} />
					<InfoRow
						label="Asset URL"
						value={
							item.assetUrl ? (
								<a
									href={item.assetUrl}
									target="_blank"
									rel="noreferrer"
									className="text-primary-dark hover:underline"
								>
									Otwórz asset
								</a>
							) : (
								"—"
							)
						}
					/>
				</div>
				<div>
					{photoUrl ? (
						<img
							src={photoUrl}
							alt="Zdjęcie analizy"
							className="max-h-80 w-full rounded-lg object-contain bg-gray-50"
						/>
					) : (
						<div className="flex h-48 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500">
							Brak zdjęcia
						</div>
					)}
				</div>
			</section>

			{!json ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					Brak szczegółów AI
				</div>
			) : (
				<>
					<section className="space-y-3">
						<h2 className="text-lg font-semibold text-gray-900">
							Top predictions
						</h2>
						{topPredictions.length === 0 ? (
							<p className="text-sm text-gray-500">Brak predictions.</p>
						) : (
							<div className="overflow-hidden rounded-xl border border-border bg-white">
								<table className="min-w-full divide-y divide-border text-sm">
									<thead className="bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
										<tr>
											<th className="px-4 py-3">Nazwa</th>
											<th className="px-4 py-3">Disease</th>
											<th className="px-4 py-3">ICD</th>
											<th className="px-4 py-3">Confidence</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{topPredictions.map((prediction, index) => (
											<tr key={`${prediction.name}-${index}`}>
												<td className="px-4 py-3 font-medium text-gray-900">
													{prediction.name}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{prediction.disease || "—"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{prediction.icd || "—"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{formatConfidence(prediction.confidence)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					<section className="space-y-3">
						<h2 className="text-lg font-semibold text-gray-900">
							Details.Predictions
						</h2>
						{detailPredictions.length === 0 ? (
							<p className="text-sm text-gray-500">
								Brak szczegółowych predictions.
							</p>
						) : (
							<div className="space-y-3">
								{detailPredictions.map((prediction, index) => (
									<article
										key={`${prediction.ExternalClassificationId}-${index}`}
										className="rounded-xl border border-border bg-white p-4"
									>
										<div className="flex flex-wrap items-start justify-between gap-2">
											<div>
												<h3 className="font-semibold text-gray-900">
													{prediction.Name}
												</h3>
												<p className="text-sm text-gray-500">
													{prediction.ClassificationName}
												</p>
											</div>
											<Badge variant="primary">
												{formatConfidence(prediction.ConfidenceWithAiModel)}
											</Badge>
										</div>
										<p className="mt-2 text-sm text-gray-600">
											ICD: {prediction.Icd || "—"}
										</p>
										<p className="mt-2 text-sm leading-relaxed text-gray-700">
											{prediction.Description || "Brak opisu."}
										</p>
									</article>
								))}
							</div>
						)}
					</section>
				</>
			)}

			{item.purchase ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-gray-900">Purchase</h2>
					<div className="grid gap-3 rounded-xl border border-border bg-white p-5 sm:grid-cols-2">
						<InfoRow label="ID" value={item.purchase.id} mono />
						<InfoRow
							label="Amount"
							value={formatAmount(item.purchase.amount, item.purchase.currency)}
						/>
						<InfoRow label="Status" value={item.purchase.paymentStatus} />
						<InfoRow
							label="Created"
							value={formatDate(item.purchase.purchaseCreationTime)}
						/>
						<InfoRow
							label="Receipt"
							value={item.purchase.receiptNumber || "—"}
						/>
						<InfoRow label="Promo" value={item.purchase.promoCode || "—"} />
					</div>
				</section>
			) : null}

			{item.doctorOpinion ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-gray-900">Doctor opinion</h2>
					<div className="grid gap-3 rounded-xl border border-border bg-white p-5 sm:grid-cols-2">
						<InfoRow label="ID" value={item.doctorOpinion.id} mono />
						<InfoRow
							label="MedChart event"
							value={item.doctorOpinion.medChartEventId || "—"}
							mono
						/>
						<div className="flex flex-wrap gap-2 sm:col-span-2">
							<Badge
								variant={
									item.doctorOpinion.requiresDoctorOpinion ? "warning" : "neutral"
								}
							>
								requiresDoctorOpinion:{" "}
								{String(item.doctorOpinion.requiresDoctorOpinion)}
							</Badge>
							<Badge
								variant={
									item.doctorOpinion.isOpinionFormCompleted ? "success" : "neutral"
								}
							>
								isOpinionFormCompleted:{" "}
								{String(item.doctorOpinion.isOpinionFormCompleted)}
							</Badge>
							<Badge
								variant={
									item.doctorOpinion.isDoctorOpinionSubmitted
										? "success"
										: "neutral"
								}
							>
								isDoctorOpinionSubmitted:{" "}
								{String(item.doctorOpinion.isDoctorOpinionSubmitted)}
							</Badge>
						</div>
					</div>
				</section>
			) : null}
		</div>
	);
}

function InfoRow({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: ReactNode;
	mono?: boolean;
}) {
	return (
		<div>
			<p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
				{label}
			</p>
			<div
				className={`mt-1 text-sm text-gray-900 ${mono ? "font-mono text-xs break-all" : ""}`}
			>
				{value}
			</div>
		</div>
	);
}
