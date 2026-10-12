import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import FeedClient from "@/components/FeedClient";
import { currentPageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await currentPageUser();
  if (!user || user.role !== "user") redirect("/login");
  return <><SiteHeader /><FeedClient /></>;
}
