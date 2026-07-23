import { apiClient } from "@/api/client";
import type { AnalysisResult } from "@/types";

export function fetchAnalysisResults() {
	return apiClient<AnalysisResult[]>("/analysis-results/admin");
}
