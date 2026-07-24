import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { sendAdminMagicLink } from "@/api/auth";
import { ApiError } from "@/api/client";
import { getUsersAdmin } from "@/api/users";
import {
	clearSession,
	getStoredSession,
	saveSession,
} from "@/auth/storage";
import type { AuthSession, UserRole } from "@/types";

type SessionInput = Pick<AuthSession, "accessToken" | "refreshToken" | "email">;

type AuthContextValue = {
	session: AuthSession | null;
	isAuthenticated: boolean;
	isInitializing: boolean;
	isRootAdmin: boolean;
	role: UserRole | null;
	loginWithEmail: (email: string) => Promise<void>;
	establishSession: (session: SessionInput) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveProfile(
	email: string,
): Promise<Pick<AuthSession, "userId" | "role"> | null> {
	const users = await getUsersAdmin();
	const me = users.find(
		(user) => user.email.toLowerCase() === email.toLowerCase(),
	);
	if (!me) return null;
	return { userId: me.id, role: me.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<AuthSession | null>(() =>
		getStoredSession(),
	);
	const [isInitializing, setIsInitializing] = useState(() =>
		Boolean(getStoredSession()?.accessToken),
	);

	const logout = useCallback(() => {
		clearSession();
		setSessionState(null);
	}, []);

	const establishSession = useCallback(async (input: SessionInput) => {
		const base: AuthSession = {
			accessToken: input.accessToken,
			refreshToken: input.refreshToken,
			email: input.email,
		};
		saveSession(base);
		setSessionState(base);

		try {
			const profile = await resolveProfile(input.email);
			const next: AuthSession = profile
				? { ...base, userId: profile.userId, role: profile.role }
				: base;
			saveSession(next);
			setSessionState(next);
		} catch {
			// Token is valid enough to stay logged in; role resolves later / on next load.
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function hydrateProfile() {
			const stored = getStoredSession();
			if (!stored?.accessToken) {
				if (!cancelled) setIsInitializing(false);
				return;
			}

			if (stored.userId && stored.role) {
				if (!cancelled) setIsInitializing(false);
				return;
			}

			try {
				const profile = await resolveProfile(stored.email);
				if (cancelled) return;
				if (profile) {
					const next = { ...stored, ...profile };
					saveSession(next);
					setSessionState(next);
				}
			} catch {
				// Keep existing session; pages will surface API errors.
			} finally {
				if (!cancelled) setIsInitializing(false);
			}
		}

		void hydrateProfile();

		return () => {
			cancelled = true;
		};
	}, []);

	const loginWithEmail = useCallback(async (email: string) => {
		try {
			await sendAdminMagicLink(email.trim().toLowerCase());
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.status === 404) {
					throw new Error(
						"Nie znaleziono użytkownika admina o tym adresie e-mail.",
					);
				}
				if (error.status === 403) {
					throw new Error(
						"To nie jest konto admina. Użyj logowania pacjenta.",
					);
				}
				if (error.status === 503) {
					throw new Error(
						"Auth / SendGrid nie jest skonfigurowane na backendzie.",
					);
				}
				throw new Error(error.message);
			}
			throw error;
		}
	}, []);

	const value = useMemo(
		() => ({
			session,
			isAuthenticated: Boolean(session?.accessToken),
			isInitializing,
			isRootAdmin: session?.role === "root_admin",
			role: session?.role ?? null,
			loginWithEmail,
			establishSession,
			logout,
		}),
		[session, isInitializing, loginWithEmail, establishSession, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return ctx;
}
