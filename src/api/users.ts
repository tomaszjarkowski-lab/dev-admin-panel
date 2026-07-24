import { apiClient, ForbiddenError } from "@/api/client";
import type { User } from "@/types";

export function getUsersAdmin() {
	return apiClient<User[]>("/users/admin");
}

/** @deprecated use getUsersAdmin */
export function fetchUsers() {
	return getUsersAdmin();
}

export async function createAdmin(email: string) {
	try {
		return await apiClient<User>("/users/admin", {
			method: "POST",
			body: { email: email.trim().toLowerCase() },
		});
	} catch (error) {
		if (error instanceof ForbiddenError) {
			throw new ForbiddenError("Brak uprawnień (wymagany root_admin)");
		}
		throw error;
	}
}

export async function deleteAdmin(userId: string) {
	try {
		await apiClient<void>(`/users/admin/${userId}`, {
			method: "DELETE",
		});
	} catch (error) {
		if (error instanceof ForbiddenError) {
			throw new ForbiddenError("Brak uprawnień (wymagany root_admin)");
		}
		throw error;
	}
}
