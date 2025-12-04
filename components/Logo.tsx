"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  className = "",
  width = 150,
  height = 40,
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return <div style={{ width, height }} className={className} />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const logoSrc =
    currentTheme === "dark"
      ? "/logo/logo-horizontal-dark.svg"
      : "/logo/logo-horizontal-light.svg";

  return (
    <Image
      src={logoSrc}
      alt="Wysenote"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
