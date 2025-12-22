"use client";

import Image from "next/image";
import { AnimatedScrollItem } from "@/components/animations";

export type StepInfo = {
  number: number;
  stepName: string;
  title: string;
  description: string;
};

export type StepSection = {
  index?: number;
  stepInfo: StepInfo;
  imgUrl: string;
  imgSide?: "left" | "right";
};

const DemoSection = ({
  index,
  stepInfo,
  imgUrl,
  imgSide = "left",
}: StepSection) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <AnimatedScrollItem
        animation={imgSide === "left" ? "fadeInLeft" : "fadeInRight"}
        distance={50}
        duration={0.6}
        delay={(index ?? 0) * 0.1}
        className={`order-2 ${imgSide === "left" ? "md:order-1" : "md:order-2"}`}
      >
        <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-border/50 flex items-center justify-center shadow-lg relative overflow-hidden">
          <Image
            src={imgUrl}
            alt={stepInfo.stepName}
            fill
            className="object-cover"
          />
        </div>
      </AnimatedScrollItem>
      <AnimatedScrollItem
        animation={imgSide === "left" ? "fadeInRight" : "fadeInLeft"}
        distance={50}
        duration={0.6}
        delay={(index ?? 0) * 0.1 + 0.15}
        className={`order-1 ${imgSide === "left" ? "md:order-2" : "md:order-1"}`}
      >
        <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
            {stepInfo.number}
          </span>
          <span>{stepInfo.stepName}</span>
        </div>
        <h3 className="text-2xl font-bold mb-3">{stepInfo.title}</h3>
        <p className="text-muted-foreground">{stepInfo.description}</p>
      </AnimatedScrollItem>
    </div>
  );
};
export default DemoSection;
