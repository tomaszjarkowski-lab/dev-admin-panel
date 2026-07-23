import type { AuthSession } from "@/types";

const STORAGE_KEY = "medmetrix_admin_session";

export function getStoredSession(): AuthSession | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as AuthSession;
		if (!parsed.accessToken || !parsed.email) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function saveSession(session: AuthSession): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
	localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
	return getStoredSession()?.accessToken ?? null;
}
