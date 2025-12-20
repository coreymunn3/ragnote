import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import AIChatDemo from "@/components/landing/AIChatDemo";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function Home() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global grid pattern for landing page */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        <LandingNavbar />
        <main className="flex-1">
          <HeroSection />
          <AIChatDemo />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
