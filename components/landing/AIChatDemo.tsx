import { MessageCircle, Brain, Sparkles } from "lucide-react";
import DemoSection, { StepInfo, StepSection } from "./DemoSection";

export default function AIChatDemo() {
  const demoSteps: StepSection[] = [
    {
      stepInfo: {
        number: 1,
        title: "Create & Organize",
        description:
          "Use our rich text editor to capture your thoughts, ideas, and knowledge. Organize everything into folders for easy management.",
      },
      imgUrl:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      imgSide: "left",
    },
    {
      stepInfo: {
        number: 2,
        title: "AI Understanding",
        description:
          "Our AI automatically analyzes and understands your notes, building a semantic understanding of your knowledge base.",
      },
      imgUrl:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      imgSide: "right",
    },
    {
      stepInfo: {
        number: 3,
        title: "Ask & Discover",
        description:
          "Ask questions in natural language and get intelligent responses based on your notes. Discover connections and insights you might have missed.",
      },
      imgUrl:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      imgSide: "left",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Chat with Your Notes
            <br />
            <span className="text-primary">Like Never Before</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ask questions, get insights, and discover connections in your
            knowledge base. Our AI understands context and provides intelligent
            responses based on your notes.
          </p>
        </div>

        {/* Demo screenshots - 3 step process */}
        <div className="max-w-6xl mx-auto space-y-12">
          {demoSteps.map((step) => (
            <DemoSection {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
