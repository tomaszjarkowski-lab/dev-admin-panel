import { apiClient } from "@/api/client";
import type { Purchase } from "@/types";

export function fetchPurchases() {
	return apiClient<Purchase[]>("/purchases/admin");
}
