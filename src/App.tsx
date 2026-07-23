import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/auth/AuthGuard";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdministratorsPage } from "@/pages/AdministratorsPage";
import { AnalysisResultDetailPage } from "@/pages/AnalysisResultDetailPage";
import { AnalysisResultsPage } from "@/pages/AnalysisResultsPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DoctorOpinionsPage } from "@/pages/DoctorOpinionsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { PurchasesPage } from "@/pages/PurchasesPage";

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />

			<Route element={<AuthGuard />}>
				<Route element={<AdminLayout />}>
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/analysis-results" element={<AnalysisResultsPage />} />
					<Route
						path="/analysis-results/:id"
						element={<AnalysisResultDetailPage />}
					/>
					<Route path="/purchases" element={<PurchasesPage />} />
					<Route path="/doctor-opinions" element={<DoctorOpinionsPage />} />
					<Route path="/patients" element={<PatientsPage />} />
					<Route path="/administrators" element={<AdministratorsPage />} />
					<Route path="/users" element={<Navigate to="/patients" replace />} />
				</Route>
			</Route>

			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}
