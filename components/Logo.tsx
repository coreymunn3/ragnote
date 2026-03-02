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
  width = 30,
  height = 30,
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

  const currentResolvedTheme = theme === "system" ? resolvedTheme : theme;

  let logoSrc =
    currentResolvedTheme === "dark"
      ? "/icons/icon-dark-512-v2.png"
      : "/icons/icon-light-512-v2.png";

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
