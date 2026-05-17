"use client";
import Link from "next/link";
import Logo from "./Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const BrandingHeader = ({ className }: { className?: string }) => {
  const isMobile = useIsMobile();
  return (
    <Link
      href="/dashboard"
      className={cn(className, "flex items-center justify-center")}
    >
      <Logo width={isMobile ? 40 : 50} height={30} />
    </Link>
  );
};
export default BrandingHeader;
