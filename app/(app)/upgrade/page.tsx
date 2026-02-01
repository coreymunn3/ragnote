import MembershipView from "@/components/MembershipView";
import { getDbUser } from "@/lib/getDbUser";

export default async function UpgradePage() {
  // Ensure user is authenticated
  await getDbUser();

  return (
    <div>
      <MembershipView upgradeOnMount={true} />
    </div>
  );
}
