import { clearSession, getAccessToken } from "@/auth/storage";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
	"http://localhost:3332";

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(status: number, message: string, body?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
	}
}

export class ForbiddenError extends ApiError {
	constructor(message = "Brak uprawnień admina") {
		super(403, message);
		this.name = "ForbiddenError";
	}
}

type RequestOptions = Omit<RequestInit, "body"> & {
	body?: unknown;
	auth?: boolean;
};

export async function apiClient<T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const { body, auth = true, headers, ...rest } = options;
	const token = getAccessToken();

	const requestHeaders = new Headers(headers);
	if (!requestHeaders.has("Content-Type") && body !== undefined) {
		requestHeaders.set("Content-Type", "application/json");
	}
	if (auth && token) {
		requestHeaders.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...rest,
		headers: requestHeaders,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (response.status === 401) {
		clearSession();
		if (window.location.pathname !== "/login") {
			window.location.assign("/login");
		}
		throw new ApiError(401, "Sesja wygasła. Zaloguj się ponownie.");
	}

	if (response.status === 403) {
		throw new ForbiddenError();
	}

	const text = await response.text();
	let data: unknown = null;
	if (text) {
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}
	}

	if (!response.ok) {
		const message =
			typeof data === "object" &&
			data !== null &&
			"message" in data &&
			typeof (data as { message: unknown }).message === "string"
				? (data as { message: string }).message
				: `Request failed (${response.status})`;
		throw new ApiError(response.status, message, data);
	}

	return data as T;
}

export { API_BASE_URL };
