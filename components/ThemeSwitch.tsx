"use client";
import React, { useEffect, useState } from "react"; // Import useEffect and useState
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false); // State to track if the component has mounted on the client
  const { theme, setTheme } = useTheme();

  const setDarkTheme = () => setTheme("dark");
  const setLightTheme = () => setTheme("light");

  // useEffect runs only on the client after the initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // During SSR or initial hydration on the client, return a placeholder or null
    // This prevents rendering theme-dependent UI until the client has fully mounted
    // and next-themes has determined the accurate client-side theme.
    return (
      <Button variant="ghost" disabled aria-label="Loading theme switch">
        {/* Optional: Add a loading spinner or an empty icon during loading */}
        {/* <Loader2 className="animate-spin" /> */}
      </Button>
    );
  }

  // Once mounted on the client, `theme` from `useTheme()` will be accurate.
  if (theme === "light") {
    return (
      <Button
        variant="ghost"
        onClick={setDarkTheme}
        aria-label="Switch to dark theme"
      >
        <MoonIcon />
      </Button>
    );
  }
  if (theme === "dark") {
    return (
      <Button
        variant="ghost"
        onClick={setLightTheme}
        aria-label="Switch to light theme"
      >
        <SunIcon />
      </Button>
    );
  }

  // Fallback for when theme is undefined (e.g., system preference) or 'system'
  // You might want to handle 'system' theme specifically if you want a different icon
  return (
    <Button variant="ghost" onClick={setDarkTheme} aria-label="Toggle theme">
      {/* Default icon if theme is 'system' or not yet set */}
      <MoonIcon />
    </Button>
  );
};

export default ThemeSwitch;
