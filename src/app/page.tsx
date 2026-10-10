import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Root route — redirect authenticated users to the dashboard,
 * unauthenticated users to the login page.
 */
export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
