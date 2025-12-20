import { MessageCircle, Brain, Sparkles } from "lucide-react";

export default function AIChatDemo() {
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
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-border/50 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-primary/60 mx-auto mb-2" />
                  <span className="text-muted-foreground text-sm">
                    Screenshot: Taking Notes
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                  1
                </span>
                <span>Create & Organize</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Write Your Notes</h3>
              <p className="text-muted-foreground">
                Use our rich text editor to capture your thoughts, ideas, and
                knowledge. Organize everything into folders for easy management.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                  2
                </span>
                <span>AI Understanding</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                AI Learns Your Knowledge
              </h3>
              <p className="text-muted-foreground">
                Our AI automatically analyzes and understands your notes,
                building a semantic understanding of your knowledge base without
                any extra work from you.
              </p>
            </div>
            <div>
              <div className="w-full aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl border border-border/50 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-secondary/60 mx-auto mb-2" />
                  <span className="text-muted-foreground text-sm">
                    Screenshot: AI Processing
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 rounded-xl border border-border/50 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-primary/60 mx-auto mb-2" />
                  <span className="text-muted-foreground text-sm">
                    Screenshot: Chat Interface
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                  3
                </span>
                <span>Ask & Discover</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Get Instant Answers</h3>
              <p className="text-muted-foreground">
                Ask questions in natural language and get intelligent responses
                based on your notes. Discover connections and insights you might
                have missed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
