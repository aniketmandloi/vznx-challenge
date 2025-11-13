import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@vznx-challenge/auth";
import { TeamContent } from "@/components/TeamContent";

export default async function TeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamContent />
    </div>
  );
}
