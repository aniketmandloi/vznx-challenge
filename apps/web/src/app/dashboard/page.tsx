import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@vznx-challenge/auth";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<DashboardContent userName={session.user.name || undefined} />
		</div>
	);
}
