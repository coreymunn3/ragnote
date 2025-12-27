"use client";

import { AnimatedScrollItem } from "@/components/animations";
import { Safari } from "@/components/ui/safari";
import { Iphone } from "@/components/ui/iphone";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type StepInfo = {
  number: number;
  stepName: string;
  title?: string;
  description: string;
};

export type StepSection = {
  index?: number;
  stepInfo: StepInfo;
  webImgLight: string;
  webImgDark: string;
  mobileImgLight: string;
  mobileImgDark: string;
  mobileSide?: "left" | "right";
};

const DemoSection = ({
  index,
  stepInfo,
  webImgLight,
  webImgDark,
  mobileImgLight,
  mobileImgDark,
  mobileSide = "right",
}: StepSection) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which images to show based on theme
  const currentTheme = mounted ? resolvedTheme || theme : "light";
  const webImg = currentTheme === "dark" ? webImgDark : webImgLight;
  const mobileImg = currentTheme === "dark" ? mobileImgDark : mobileImgLight;

  return (
    <div className="flex flex-col w-full space-y-8">
      {/* Text section - centered at top */}
      <AnimatedScrollItem
        animation="fadeInLeft"
        distance={30}
        duration={0.6}
        delay={(index ?? 0) * 0.1}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
            {stepInfo.number}
          </span>
          <span>{stepInfo.stepName}</span>
        </div>
        {stepInfo.title && (
          <h3 className="text-2xl font-bold mb-3">{stepInfo.title}</h3>
        )}
        <p className="text-muted-foreground text-lg">{stepInfo.description}</p>
      </AnimatedScrollItem>

      {/* Images section - side by side, full width */}
      <AnimatedScrollItem
        animation={"fadeInRight"}
        distance={50}
        duration={0.8}
        delay={(index ?? 0) * 0.1 + 0.2}
        className="w-full"
      >
        <div className="relative w-full">
          {/* Safari (web) mockup */}
          <div className="">
            <Safari
              imageSrc={webImg}
              url="wysenote.com"
              className="w-full drop-shadow-2xl"
            />
          </div>

          {/* iPhone (mobile) mockup */}
          <div
            className={`w-[150px] md:w-[200px] xl:w-[350px] absolute z-10 bottom-0 ${mobileSide === "left" ? "left-0 md:-left-10" : "right-0 md:-right-10"}`}
          >
            <Iphone src={mobileImg} className="w-full drop-shadow-2xl" />
          </div>
        </div>
      </AnimatedScrollItem>
    </div>
  );
};
export default DemoSection;
