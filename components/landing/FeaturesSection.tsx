import { MEMBERSHIP_FEATURES } from "@/CONSTANTS";
import { Card, CardContent } from "@/components/ui/card";
import { getIconComponent } from "@/lib/utils";

export default function FeaturesSection() {
  // Combine FREE and PRO features for comprehensive overview
  const allFeatures = [
    ...MEMBERSHIP_FEATURES.FREE.features,
    ...MEMBERSHIP_FEATURES.PRO.features,
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <br />
            <span className="text-primary">Manage Your Knowledge</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete toolkit for capturing, organizing, and retrieving your
            thoughts and ideas with the power of AI.
          </p>
        </div>

        {/* Features grid */}
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feature, index) => {
            const Icon = getIconComponent(feature.icon);
            // Cycle through colors for visual interest
            const colors = [
              "text-primary",
              "text-secondary",
              "text-blue-500",
              "text-purple-500",
              "text-orange-500",
              "text-green-500",
              "text-yellow-500",
              "text-pink-500",
              "text-teal-500",
              "text-indigo-500",
            ];
            const color = colors[index % colors.length];

            return (
              <Card
                key={index}
                className="border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.text}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
