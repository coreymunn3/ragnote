import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import AIChatDemo from "@/components/landing/AIChatDemo";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import LandingFooter from "@/components/landing/LandingFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { siteConfig } from "@/config/site";

// Cache the landing page for 1 hour to improve performance for unauthenticated visitors
export const revalidate = 3600;

export default async function Home() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // Structured data for SEO (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/icons/icon-512x512.png`,
        },
        sameAs: [
          // Add your social media profiles here when available
          // "https://twitter.com/wysenote",
          // "https://linkedin.com/company/wysenote",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          "@id": `${siteConfig.url}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "ProductivityApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        operatingSystem: "Web Browser",
        description: siteConfig.description,
        featureList: [
          "AI-powered note-taking",
          "Semantic search",
          "Chat with your notes",
          "Knowledge organization",
          "RAG (Retrieval Augmented Generation)",
        ],
      },
    ],
  };

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col relative">
        {/* Global grid pattern for landing page */}
        <div className="fixed inset-0">
          <BackgroundPattern />
        </div>

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
    </>
  );
}
