"use client";

import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import BackgroundPattern from "../BackgroundPattern";
import { AuroraText } from "@/components/ui/aurora-text";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[800px]">
      {/* Custom keyframe animations */}
      <style jsx>{`
        @keyframes float1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-150px, 100px);
          }
        }
        @keyframes float2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(200px, 30px);
          }
        }
        @keyframes float3 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(50px, 150px);
          }
        }
      `}</style>
      {/* Layered gradient background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient using theme colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />

        {/* Large radial gradient orbs for depth - with floating animation */}
        {/* Orb 1: top-right → center */}
        <div
          className="absolute -top-20 -right-20 w-[500] h-[500] rounded-full bg-gradient-to-br from-primary/40 to-primary/20 blur-3xl"
          style={{ animation: "float1 25s ease-in-out infinite" }}
        />
        {/* Orb 2: bottom-left → bottom-right */}
        <div
          className="absolute -bottom-40 -left-40 w-[600] h-[600] rounded-full bg-gradient-to-br from-secondary/40 to-purple-500/30 blur-3xl"
          style={{ animation: "float2 15s ease-in-out infinite" }}
        />
        {/* Orb 3: top-left → bottom-left */}
        <div
          className="absolute -top-20 -left-20 w-[500] h-[500] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl"
          style={{ animation: "float3 15s ease-in-out infinite" }}
        />

        {/* Subtle grid pattern for texture */}
        <BackgroundPattern />
      </div>

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/50 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              AI-Powered Knowledge Base
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your Notes,
            <br />
            <AuroraText
              colors={[
                "hsl(var(--primary))",
                "hsl(var(--secondary))",
                "#a855f7",
                "#3b82f6",
              ]}
              speed={0.8}
            >
              Supercharged by AI
            </AuroraText>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Wysenote combines the simplicity of modern note-taking with the
            power of AI. Capture your thoughts, organize your knowledge, and
            chat with your notes naturally.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="gap-2 text-base px-8 bg-gradient-to-br from-primary to-secondary"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
            {/* <Button
              size="lg"
              variant="ghost"
              className="text-base px-8 bg-transparent"
            >
              View Demo
            </Button> */}
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required · Free tier available forever
          </p>
        </div>
      </div>
    </section>
  );
}
