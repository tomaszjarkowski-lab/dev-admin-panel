import { apiClient } from "@/api/client";
import type { DoctorOpinion } from "@/types";

export function fetchDoctorOpinions() {
	return apiClient<DoctorOpinion[]>("/doctor-opinions/admin");
}
