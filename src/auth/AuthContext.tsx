import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { sendAdminMagicLink } from "@/api/auth";
import { ApiError } from "@/api/client";
import {
	clearSession,
	getStoredSession,
	saveSession,
} from "@/auth/storage";
import type { AuthSession } from "@/types";

type AuthContextValue = {
	session: AuthSession | null;
	isAuthenticated: boolean;
	isInitializing: boolean;
	loginWithEmail: (email: string) => Promise<void>;
	setSession: (session: AuthSession) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<AuthSession | null>(() =>
		getStoredSession(),
	);
	const [isInitializing] = useState(false);

	const setSession = useCallback((next: AuthSession) => {
		saveSession(next);
		setSessionState(next);
	}, []);

	const logout = useCallback(() => {
		clearSession();
		setSessionState(null);
	}, []);

	const loginWithEmail = useCallback(async (email: string) => {
		try {
			await sendAdminMagicLink(email.trim().toLowerCase());
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.status === 404) {
					throw new Error("Nie znaleziono użytkownika admina o tym adresie e-mail.");
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
			loginWithEmail,
			setSession,
			logout,
		}),
		[session, isInitializing, loginWithEmail, setSession, logout],
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
