import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@vznx-challenge/auth";
import { ProjectDetailContent } from "@/components/ProjectDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  // Following Next.js 15 async params pattern
  const { id } = await params;
  const projectId = parseInt(id, 10);

  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Validate project ID
  if (isNaN(projectId)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectDetailContent projectId={projectId} />
    </div>
  );
}
