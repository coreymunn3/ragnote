import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <p>This page is using the conditional layout system.</p>
    </div>
  );
}
