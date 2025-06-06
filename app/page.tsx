import { Button } from "@heroui/button";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto">
      <p className="text-center">This is a Landing Page! To Do!</p>
      <SignedOut>
        <div className="flex gap-2 justify-center">
          <Button color="primary">
            <SignInButton />
          </Button>
          <Button>
            <SignUpButton />
          </Button>
        </div>
      </SignedOut>
    </div>
  );
}
