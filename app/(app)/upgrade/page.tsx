import MembershipView from "@/components/MembershipView";

export default async function UpgradePage() {
  // Ensure user is authenticated

  return (
    <div>
      <MembershipView upgradeOnMount={true} />
    </div>
  );
}
