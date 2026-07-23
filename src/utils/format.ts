import type { AnalysisResult, AnalysisResultJson, Prediction } from "@/types";

export function asAnalysisJson(
	value: AnalysisResult["analysisResultJson"],
): AnalysisResultJson | null {
	if (!value || typeof value !== "object") return null;
	return value;
}

export function getTopPrediction(
	json: AnalysisResult["analysisResultJson"],
): Prediction | null {
	const parsed = asAnalysisJson(json);
	const predictions = parsed?.ResponseMessage?.predictions;
	if (!predictions?.length) return null;

	return [...predictions].sort((a, b) => b.confidence - a.confidence)[0];
}

export function formatConfidence(value: number | undefined | null): string {
	if (value == null || Number.isNaN(value)) return "—";
	const pct = value <= 1 ? value * 100 : value;
	return `${pct.toFixed(1)}%`;
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("pl-PL", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function formatAmount(
	amount: string | number,
	currency: string,
): string {
	const numeric = typeof amount === "string" ? Number(amount) : amount;
	if (Number.isNaN(numeric)) return `${amount} ${currency}`;
	try {
		return new Intl.NumberFormat("pl-PL", {
			style: "currency",
			currency: currency || "PLN",
		}).format(numeric);
	} catch {
		return `${numeric} ${currency}`;
	}
}

export function formatFileSize(size: string): string {
	const numeric = Number(size);
	if (Number.isNaN(numeric)) return size;
	if (numeric < 1024) return `${numeric} B`;
	if (numeric < 1024 * 1024) return `${(numeric / 1024).toFixed(1)} KB`;
	return `${(numeric / (1024 * 1024)).toFixed(1)} MB`;
}
