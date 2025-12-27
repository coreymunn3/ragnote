import { MessageCircle, Brain, Sparkles } from "lucide-react";
import DemoSection, { StepInfo, StepSection } from "./DemoSection";
import { AnimatedScrollItem } from "../animations";
import SectionHeader from "./SectionHeader";

export default function AIChatDemo() {
  const demoSteps: StepSection[] = [
    {
      stepInfo: {
        number: 1,
        stepName: "Create & Organize",
        // title: "Create",
        description:
          "Use our rich text editor to capture your thoughts, ideas, and knowledge. Organize everything into folders for easy management.",
      },
      webImgLight: "/demo/step1-web-light.png",
      webImgDark: "/demo/step1-web-dark.png",
      mobileImgLight: "/demo/step1-mobile-light.png",
      mobileImgDark: "/demo/step1-mobile-dark.png",
    },
    {
      stepInfo: {
        number: 2,
        stepName: "AI Understanding",
        // title: "Publish",
        description:
          "As you create published versions, our AI automatically analyzes and understands your notes, building a semantic understanding of your knowledge base.",
      },
      webImgLight: "/demo/step2-web-light.png",
      webImgDark: "/demo/step2-web-dark.png",
      mobileImgLight: "/demo/step2-mobile-light.png",
      mobileImgDark: "/demo/step2-mobile-dark.png",
    },
    {
      stepInfo: {
        number: 3,
        stepName: "Ask & Discover",
        // title: "Chat & Discover",
        description:
          "Ask questions in natural language and get intelligent responses based on your notes. Discover connections and insights you might have missed.",
      },
      webImgLight: "/demo/step3-web-light.png",
      webImgDark: "/demo/step3-web-dark.png",
      mobileImgLight: "/demo/step3-mobile-light.png",
      mobileImgDark: "/demo/step3-mobile-dark.png",
      mobileSide: "left",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionHeader
          topText="Chat with Your Notes"
          primaryText="Like Never Before"
          description="Ask questions, get insights, and discover connections in your
              knowledge base. Our AI understands context and provides
              intelligent responses based on your notes."
        />

        {/* Demo screenshots - 3 step process */}
        <div className="space-y-12">
          {demoSteps.map((step, idx) => (
            <DemoSection index={idx} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
