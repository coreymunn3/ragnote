import MembershipView from "@/components/MembershipView";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function UpgradePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <div>
      <MembershipView upgradeOnMount={true} />
    </div>
  );
}
