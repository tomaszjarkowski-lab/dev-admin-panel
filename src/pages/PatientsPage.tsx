import { UsersListPage } from "@/pages/UsersListPage";

export function PatientsPage() {
	return (
		<UsersListPage
			mode="patients"
			title="Pacjenci"
			description="Użytkownicy z rolą patient"
			emptyTitle="Brak pacjentów"
		/>
	);
}
