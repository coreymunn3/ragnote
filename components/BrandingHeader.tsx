"use client";
import Link from "next/link";
import Logo from "./Logo";
import { useIsMobile } from "@/hooks/use-mobile";

const BrandingHeader = () => {
  const isMobile = useIsMobile();
  return (
    <Link href="/dashboard" className="flex items-center justify-center">
      <Logo width={isMobile ? 40 : 70} height={30} variant={"iconWithText"} />
    </Link>
  );
};
export default BrandingHeader;
