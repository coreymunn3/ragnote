import { MEMBERSHIP_FEATURES } from "@/CONSTANTS";
import PricingCard from "./PricingCard";
import SectionHeader from "./SectionHeader";
import { AnimatedScrollItem } from "../animations";

export default function PricingSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionHeader
          primaryText="Choose Your Plan"
          description=" Start free and upgrade when you're ready to unlock the full power of
            AI."
        />

        {/* Pricing cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* FREE Tier */}
          <AnimatedScrollItem
            animation="fadeInUp"
            delay={0.3}
            duration={0.5}
            distance={30}
          >
            <PricingCard
              name={MEMBERSHIP_FEATURES.FREE.name}
              icon={MEMBERSHIP_FEATURES.FREE.icon}
              iconColor={MEMBERSHIP_FEATURES.FREE.color}
              priceLabel="Forever free"
              description="Essential features to get started"
              features={MEMBERSHIP_FEATURES.FREE.features}
              buttonText="Get Started Free"
              buttonVariant="outline"
              emphasized={false}
            />
          </AnimatedScrollItem>

          {/* PRO Tier - Emphasized */}
          <AnimatedScrollItem
            animation="fadeInUp"
            delay={0.5}
            duration={0.5}
            distance={30}
          >
            <PricingCard
              name={MEMBERSHIP_FEATURES.PRO.name}
              icon="Crown"
              iconColor="text-primary"
              price={MEMBERSHIP_FEATURES.PRO.price}
              priceLabel="Unlock all AI features"
              description="Full access to all premium features"
              features={MEMBERSHIP_FEATURES.PRO.features}
              buttonText="Upgrade to Pro"
              buttonVariant="default"
              emphasized={true}
              badge="Recommended"
              showEverythingInFree={true}
              redirectToUpgrade={true}
            />
          </AnimatedScrollItem>
        </div>

        {/* Additional info */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include secure cloud storage and cross-device sync.
          <br />
          Cancel anytime, no questions asked.
        </p>
      </div>
    </section>
  );
}
