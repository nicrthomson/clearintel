import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardView } from "@/app/components/Dashboard/DashboardView";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardView />
    </div>
  );
}
