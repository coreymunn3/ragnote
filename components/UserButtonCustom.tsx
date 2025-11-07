"use client";

import { UserButton } from "@clerk/nextjs";
import { DotIcon } from "lucide-react";

const CustomPage = () => {
  return (
    <div>
      <h1>Custom page</h1>
      <p>This is the content of the custom page.</p>
    </div>
  );
};

export default function UserButtonCustom() {
  return (
    <UserButton>
      {/* You can pass the content as a component */}
      <UserButton.UserProfilePage
        label="Custom Page"
        url="custom"
        labelIcon={<DotIcon />}
      >
        <CustomPage />
      </UserButton.UserProfilePage>
      <UserButton.UserProfileLink
        label="Homepage"
        url="/"
        labelIcon={<DotIcon />}
      />
    </UserButton>
  );
}
