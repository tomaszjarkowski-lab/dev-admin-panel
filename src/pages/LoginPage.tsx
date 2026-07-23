import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { MedMetrixLogo } from "@/components/MedMetrixLogo";

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginPage() {
	const { isAuthenticated, loginWithEmail } = useAuth();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sentToEmail, setSentToEmail] = useState<string | null>(null);

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	const trimmedEmail = email.trim();
	const canSubmit = isValidEmail(trimmedEmail) && !loading;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSubmit) return;

		setLoading(true);
		setError(null);
		setSentToEmail(null);

		try {
			await loginWithEmail(trimmedEmail);
			setSentToEmail(trimmedEmail);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
			);
		} finally {
			setLoading(false);
		}
	}

	function handleReset() {
		setSentToEmail(null);
		setError(null);
	}

	return (
		<main className="login-page">
			<div className="login-page__backdrop" aria-hidden="true" />

			<div className="login-shell">
				<section className="login-card" aria-labelledby="login-title">
					<header className="login-card__header">
						<MedMetrixLogo className="medmetrix-logo" size="lg" />
						<p className="login-card__eyebrow">Panel administracyjny</p>
						<h1 id="login-title" className="login-card__title">
							{sentToEmail
								? "Sprawdź swoją skrzynkę"
								: "Zaloguj się do MedMetrix Admin"}
						</h1>
						<p className="login-card__subtitle">
							{sentToEmail
								? "Sprawdź skrzynkę — wysłaliśmy link do logowania."
								: "Wyślemy bezpieczny link logowania na adres e-mail admina. Nie potrzebujesz hasła."}
						</p>
					</header>

					{!sentToEmail ? (
						<form className="login-form" onSubmit={handleSubmit} noValidate>
							<label className="login-field" htmlFor="email">
								<span>Adres e-mail</span>
								<input
									id="email"
									type="email"
									autoComplete="email"
									inputMode="email"
									placeholder="admin@medmetrix.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (error) setError(null);
									}}
									disabled={loading}
									aria-invalid={Boolean(error)}
									aria-describedby={error ? "login-error" : "login-hint"}
								/>
							</label>

							<p id="login-hint" className="login-hint">
								Użyj adresu konta z rolą admin lub root_admin.
							</p>

							{error ? (
								<div
									id="login-error"
									className="login-alert login-alert--error"
									role="alert"
								>
									{error}
								</div>
							) : null}

							<button
								type="submit"
								className="login-submit"
								disabled={!canSubmit}
							>
								{loading ? (
									<span className="login-submit__loading">
										<span className="login-spinner" aria-hidden="true" />
										Wysyłanie linku…
									</span>
								) : (
									"Zaloguj się"
								)}
							</button>
						</form>
					) : (
						<section className="login-success" aria-live="polite">
							<div className="login-alert login-alert--success">
								<p>
									Sprawdź skrzynkę — wysłaliśmy link do logowania na adres{" "}
									<strong>{sentToEmail}</strong>.
								</p>
								<p>
									Otwórz wiadomość od MedMetrix i kliknij link, aby wejść do
									panelu admina. Link jest jednorazowy i może wygasnąć.
								</p>
							</div>

							<p className="login-hint">
								Nie widzisz maila? Sprawdź folder spam / oferty.
							</p>

							<button
								type="button"
								className="login-secondary"
								onClick={handleReset}
							>
								Użyj innego e-maila
							</button>
						</section>
					)}
				</section>

				<p className="login-footer">
					Bezpieczne logowanie admina bez hasła · MedMetrix
				</p>
			</div>
		</main>
	);
}
