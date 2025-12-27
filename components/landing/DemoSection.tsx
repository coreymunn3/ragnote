"use client";

import { AnimatedScrollItem } from "@/components/animations";
import { Safari } from "@/components/ui/safari";
import { Iphone } from "@/components/ui/iphone";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<"web" | "mobile">("web");

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which images to show based on theme
  const currentTheme = mounted ? resolvedTheme || theme : "light";
  const webImg = currentTheme === "dark" ? webImgDark : webImgLight;
  const mobileImg = currentTheme === "dark" ? mobileImgDark : mobileImgLight;

  // Handle image click
  const handleWebClick = () => {
    setSelectedDevice("web");
    setDialogOpen(true);
  };

  const handleMobileClick = () => {
    setSelectedDevice("mobile");
    setDialogOpen(true);
  };

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
          {/* Safari (web) mockup - clickable */}
          <div
            onClick={handleWebClick}
            className="cursor-pointer hover:scale-[1.05] transition-all duration-300 ease-in-out hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
            <Safari
              imageSrc={webImg}
              url="wysenote.com"
              className="w-full drop-shadow-2xl"
            />
          </div>

          {/* iPhone (mobile) mockup - clickable */}
          <div
            onClick={handleMobileClick}
            className={`w-[150px] md:w-[200px] xl:w-[350px] absolute z-10 bottom-0 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${mobileSide === "left" ? "left-0 md:-left-10" : "right-0 md:-right-10"}`}
          >
            <Iphone src={mobileImg} className="w-full drop-shadow-2xl" />
          </div>
        </div>
      </AnimatedScrollItem>

      {/* Full-size image dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {selectedDevice === "web" ? (
              <div className="w-full max-w-5xl">
                <Safari
                  imageSrc={webImg}
                  url="wysenote.com"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="w-full max-w-md overflow-hidden">
                <Iphone src={mobileImg} className="w-full" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default DemoSection;
