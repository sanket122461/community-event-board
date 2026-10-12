import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AdminDashboard from "@/components/AdminDashboard";
import { currentPageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentPageUser();
  if (!user || user.role !== "admin") redirect("/admin/login");
  return <><SiteHeader /><AdminDashboard /></>;
}
