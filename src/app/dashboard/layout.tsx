import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <DashboardNav user={session.user} />
      <main
        id="main-content"
        className="flex-1 min-w-0 px-margin-mobile md:px-gutter py-stack-md md:py-stack-lg"
      >
        {children}
      </main>
    </div>
  );
}
