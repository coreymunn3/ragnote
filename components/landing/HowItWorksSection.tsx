import { FileEdit, Brain, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: FileEdit,
    number: 1,
    title: "Create Notes",
    description:
      "Write and organize your notes using our rich text editor. Create folders to keep everything structured.",
  },
  {
    icon: Brain,
    number: 2,
    title: "AI Learns",
    description:
      "Our AI automatically processes your notes and builds a semantic understanding of your knowledge base.",
  },
  {
    icon: MessageSquare,
    number: 3,
    title: "Ask Questions",
    description:
      "Chat with your notes naturally. Get instant answers and discover insights you didn't know existed.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes. It's as simple as taking notes, and the AI
            does the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  {/* Icon circle */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-background shadow-lg mb-6">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
