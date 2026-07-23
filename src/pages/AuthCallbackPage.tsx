import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyMagicLink } from "@/api/auth";
import { useAuth } from "@/auth/AuthContext";
import { MedMetrixLogo } from "@/components/MedMetrixLogo";

function getHashParams(): URLSearchParams {
	const hash = window.location.hash.startsWith("#")
		? window.location.hash.slice(1)
		: window.location.hash;
	return new URLSearchParams(hash);
}

function getEmailFromAccessToken(accessToken: string): string | null {
	try {
		const [, payload] = accessToken.split(".");
		if (!payload) return null;
		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const json = JSON.parse(atob(normalized)) as { email?: string };
		return json.email ?? null;
	} catch {
		return null;
	}
}

export function AuthCallbackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { setSession } = useAuth();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function completeAuth() {
			try {
				const hashParams = getHashParams();

				const hashedToken =
					searchParams.get("hashed_token") ||
					searchParams.get("hashedToken") ||
					searchParams.get("token_hash") ||
					hashParams.get("hashed_token") ||
					hashParams.get("hashedToken") ||
					hashParams.get("token_hash");

				if (hashedToken) {
					const result = await verifyMagicLink(hashedToken);
					if (cancelled) return;
					setSession({
						accessToken: result.accessToken,
						refreshToken: result.refreshToken,
						email: result.email,
					});
					navigate("/dashboard", { replace: true });
					return;
				}

				const accessToken =
					searchParams.get("access_token") || hashParams.get("access_token");
				const refreshToken =
					searchParams.get("refresh_token") || hashParams.get("refresh_token");
				const email =
					searchParams.get("email") ||
					hashParams.get("email") ||
					(accessToken ? getEmailFromAccessToken(accessToken) : null);

				if (accessToken && refreshToken && email) {
					if (cancelled) return;
					setSession({ accessToken, refreshToken, email });
					navigate("/dashboard", { replace: true });
					return;
				}

				throw new Error(
					"Nie znaleziono tokenów w callbacku. Sprawdź SUPABASE_ADMIN_AUTH_REDIRECT_URL na backendzie.",
				);
			} catch (err) {
				if (cancelled) return;
				setError(
					err instanceof Error
						? err.message
						: "Logowanie nie powiodło się. Spróbuj ponownie.",
				);
			}
		}

		void completeAuth();

		return () => {
			cancelled = true;
		};
	}, [navigate, searchParams, setSession]);

	if (error) {
		return (
			<main className="login-page">
				<div className="login-page__backdrop" aria-hidden="true" />
				<div className="login-shell">
					<section className="login-card text-center">
						<header className="login-card__header">
							<MedMetrixLogo size="lg" />
							<p className="login-card__eyebrow">Panel administracyjny</p>
							<h1 className="login-card__title">Logowanie nie powiodło się</h1>
						</header>
						<div className="login-alert login-alert--error" role="alert">
							{error}
						</div>
						<button
							type="button"
							className="login-submit mt-4"
							onClick={() => navigate("/login", { replace: true })}
						>
							Wróć do logowania
						</button>
					</section>
				</div>
			</main>
		);
	}

	return (
		<main className="login-page">
			<div className="login-page__backdrop" aria-hidden="true" />
			<div className="login-shell">
				<section className="login-card text-center">
					<header className="login-card__header" style={{ marginBottom: "1rem" }}>
						<MedMetrixLogo size="lg" />
						<p className="login-card__eyebrow">Panel administracyjny</p>
						<h1 className="login-card__title">Finalizowanie logowania…</h1>
					</header>
					<div className="flex justify-center py-2">
						<span
							className="login-spinner login-spinner--primary"
							aria-hidden="true"
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
