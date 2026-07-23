import { apiClient } from "@/api/client";
import type { User } from "@/types";

export function fetchUsers() {
	return apiClient<User[]>("/users/admin");
}
