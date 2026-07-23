import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPurchases } from "@/api/purchases";
import { ForbiddenError } from "@/api/client";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import type { Purchase } from "@/types";
import { formatAmount, formatDate } from "@/utils/format";

export function PurchasesPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<Purchase[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchPurchases();
			setItems(data);
		} catch (err) {
			if (err instanceof ForbiddenError) {
				setError("Brak uprawnień admina");
			} else {
				setError(err instanceof Error ? err.message : "Nie udało się pobrać płatności.");
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
				<h1 className="text-2xl font-semibold text-gray-900">Płatności</h1>
				<p className="mt-1 text-sm text-gray-500">
					Lista zakupów (sortowanie DESC po dacie)
				</p>
			</div>

			{loading ? (
				<TableSkeleton rows={8} />
			) : error ? (
				<ErrorState message={error} onRetry={load} />
			) : items.length === 0 ? (
				<EmptyState title="Brak płatności" />
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-white">
					<table className="min-w-full divide-y divide-border text-sm">
						<thead className="bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
							<tr>
								<th className="px-4 py-3">Data</th>
								<th className="px-4 py-3">Kwota</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">Receipt</th>
								<th className="px-4 py-3">Promo</th>
								<th className="px-4 py-3">Subskrypcja</th>
								<th className="px-4 py-3">User ID</th>
								<th className="px-4 py-3">Analysis ID</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{items.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 whitespace-nowrap text-gray-700">
										{formatDate(item.purchaseCreationTime)}
									</td>
									<td className="px-4 py-3 font-medium text-gray-900">
										{formatAmount(item.amount, item.currency)}
									</td>
									<td className="px-4 py-3">
										<Badge
											variant={
												item.paymentStatus.toLowerCase() === "completed" ||
												item.paymentStatus.toLowerCase() === "paid"
													? "success"
													: item.paymentStatus.toLowerCase() === "pending"
														? "warning"
														: "neutral"
											}
										>
											{item.paymentStatus}
										</Badge>
									</td>
									<td className="px-4 py-3 text-gray-700">
										{item.receiptNumber || "—"}
									</td>
									<td className="px-4 py-3 text-gray-700">
										{item.promoCode || "—"}
									</td>
									<td className="px-4 py-3">
										<Badge variant={item.isSubscriptionPurchased ? "primary" : "neutral"}>
											{item.isSubscriptionPurchased ? "Tak" : "Nie"}
										</Badge>
									</td>
									<td className="px-4 py-3 font-mono text-xs text-gray-600">
										{item.userId}
									</td>
									<td className="px-4 py-3">
										<Link
											to={`/analysis-results/${item.analysisResultId}`}
											className="font-mono text-xs text-primary-dark hover:underline"
										>
											{item.analysisResultId}
										</Link>
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
