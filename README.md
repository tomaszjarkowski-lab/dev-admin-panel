# Medmetrix Admin Panel

Frontend panelu administracyjnego Medmetrix (Vite + React + TypeScript + Tailwind + React Router).

## Stack

- TypeScript
- React 19
- React Router v6+
- Tailwind CSS v4
- Vite

## Uruchomienie

```bash
npm install
cp .env.example .env
npm run dev
```

Aplikacja startuje na [http://localhost:5173](http://localhost:5173) (port whitelisted w CORS backendu).

## Zmienne środowiskowe

```env
VITE_API_BASE_URL=http://localhost:3332
```

| Zmienna | Opis |
|---|---|
| `VITE_API_BASE_URL` | Base URL backendu Medmetrix |

### Backend (wymagane do logowania)

- `SUPABASE_ADMIN_AUTH_REDIRECT_URL` powinno wskazywać na frontend, np.:
  `http://localhost:5173/auth/callback`
- CORS backendu musi pozwalać origin FE (`localhost:5173` / `3000`). Jeśli używasz innego portu — dodaj go do whitelist CORS.

## Logowanie admina

1. Wejdź na `/login` i podaj e-mail konta z rolą `admin` lub `root_admin`.
2. FE wysyła `POST /auth/admin/magic-link` z `{ "email": "..." }` (nie patient `/auth/magic-link`).
3. Po sukcesie pokazuje komunikat: „Sprawdź skrzynkę — wysłaliśmy link do logowania”.
4. Klik w mailu wraca na `/auth/callback` z tokenami w hash/query (`access_token`, `refresh_token`) albo z `hashed_token`.
5. Callback zapisuje lokalnie:
   - `access_token`
   - `refresh_token`
   - `email`
6. Redirect na `/dashboard`.

Obsługiwane błędy magic link:

- `404` — admin user not found
- `403` — to nie konto admina
- `503` — auth/SendGrid nie skonfigurowane

Dodatkowo callback wspiera:
`POST /auth/verify-magic-link` z `hashedToken` w query (`?hashed_token=` / `?hashedToken=` / `?token_hash=`).

## Auth guard

- Chronione route’y wymagają `access_token` w localStorage.
- `401` → czyszczenie sesji + redirect `/login`.
- `403` → komunikat „Brak uprawnień admina”.
- Logout (przycisk w topbarze) czyści tokeny i wraca na `/login`.

## Route’y

| Path | Opis |
|---|---|
| `/login` | Magic link login |
| `/auth/callback` | Odbior tokenów / verify callback |
| `/dashboard` | KPI + ostatnie analizy |
| `/analysis-results` | Lista analiz |
| `/analysis-results/:id` | Szczegóły analizy + AI JSON |
| `/purchases` | Płatności |
| `/doctor-opinions` | Opinie lekarza |
| `/patients` | Pacjenci (rola patient) |
| `/administrators` | Administratorzy (admin / root_admin) |

## Admin API (tylko `/admin`)

Wszystkie requesty z headerem `Authorization: Bearer <access_token>`:

- `GET /analysis-results/admin`
- `GET /purchases/admin`
- `GET /doctor-opinions/admin`
- `GET /users/admin`

## Struktura

```text
src/
  api/          # fetch wrapper + endpointy
  auth/         # context, guard, storage
  components/   # UI wspólne
  layouts/      # sidebar + topbar
  pages/        # ekrany
  types/        # TypeScript types
  utils/        # formatowanie / predictions
```

## Skrypty

```bash
npm run dev       # development
npm run build     # production build
npm run preview   # podgląd builda
npm run lint      # ESLint
```
