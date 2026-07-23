import { apiClient } from "@/api/client";
import type { MagicLinkResponse, VerifyMagicLinkResponse } from "@/types";

export function sendAdminMagicLink(email: string) {
	return apiClient<MagicLinkResponse>("/auth/admin/magic-link", {
		method: "POST",
		body: { email },
		auth: false,
	});
}

export function verifyMagicLink(hashedToken: string) {
	return apiClient<VerifyMagicLinkResponse>("/auth/verify-magic-link", {
		method: "POST",
		body: { hashedToken },
		auth: false,
	});
}
