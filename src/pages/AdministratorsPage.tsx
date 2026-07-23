import { UsersListPage } from "@/pages/UsersListPage";

export function AdministratorsPage() {
	return (
		<UsersListPage
			mode="administrators"
			title="Administratorzy"
			description="Użytkownicy z rolą admin lub root_admin"
			emptyTitle="Brak administratorów"
		/>
	);
}
