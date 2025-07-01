"use client";

import dynamic from "next/dynamic";
import "@blocknote/mantine/style.css";
import "../styles/blocknote-custom.css";
import type { BlockNoteEditor } from "@blocknote/core";
import type { Theme } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface RichTextEditorProps {
  initialContent?: any; // BlockNote JSON content
  onChange?: (editor: BlockNoteEditor) => void;
  readOnly?: boolean;
  className?: string;
}

// Utility function to get CSS variable value - client-side only
const getCssVar = (name: string): string => {
  if (typeof window === "undefined" || typeof document === "undefined")
    return "";
  try {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  } catch (error) {
    return "";
  }
};

// Convert HSL variable to color
const hslFromVar = (varName: string): string => {
  const value = getCssVar(varName);
  return value ? `hsl(${value})` : "";
};

// Create a custom BlockNote theme using your app's CSS variables
const createCustomTheme = (isDarkMode: boolean, isMounted: boolean): Theme => {
  // Fallback colors
  const fallbackColors = {
    editor: {
      text: isDarkMode ? "#ffffff" : "#000000",
      background: "transparent",
    },
    menu: {
      text: isDarkMode ? "#ffffff" : "#000000",
      background: isDarkMode ? "#262626" : "#ffffff",
    },
    tooltip: {
      text: isDarkMode ? "#ffffff" : "#000000",
      background: isDarkMode ? "#262626" : "#f5f5f5",
    },
    hovered: {
      text: isDarkMode ? "#ffffff" : "#000000",
      background: isDarkMode ? "#404040" : "#f0f0f0",
    },
    selected: {
      text: "#ffffff",
      background: isDarkMode ? "#6366f1" : "#4f46e5",
    },
    disabled: {
      text: isDarkMode ? "#737373" : "#a3a3a3",
      background: isDarkMode ? "#171717" : "#f5f5f5",
    },
    shadow: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)",
    border: isDarkMode ? "#404040" : "#e5e5e5",
    sideMenu: isDarkMode ? "#6366f1" : "#4f46e5",
  };

  // Use CSS variables when mounted on client
  const colors = isMounted
    ? {
        editor: {
          text: hslFromVar("--foreground") || fallbackColors.editor.text,
          background: "transparent", // Always transparent to match app background
        },
        menu: {
          text: hslFromVar("--popover-foreground") || fallbackColors.menu.text,
          background: hslFromVar("--popover") || fallbackColors.menu.background,
        },
        tooltip: {
          text:
            hslFromVar("--popover-foreground") || fallbackColors.tooltip.text,
          background:
            hslFromVar("--popover") || fallbackColors.tooltip.background,
        },
        hovered: {
          text:
            hslFromVar("--accent-foreground") || fallbackColors.hovered.text,
          background:
            hslFromVar("--accent") || fallbackColors.hovered.background,
        },
        selected: {
          text:
            hslFromVar("--primary-foreground") || fallbackColors.selected.text,
          background:
            hslFromVar("--primary") || fallbackColors.selected.background,
        },
        disabled: {
          text:
            hslFromVar("--muted-foreground") || fallbackColors.disabled.text,
          background:
            hslFromVar("--muted") || fallbackColors.disabled.background,
        },
        shadow: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)",
        border: hslFromVar("--border") || fallbackColors.border,
        sideMenu: hslFromVar("--primary") || fallbackColors.sideMenu,
      }
    : fallbackColors;

  return {
    colors: colors,
    borderRadius: parseInt(getCssVar("--radius")) || 16,
    fontFamily: "var(--font-sans)",
  };
};

// Dynamically import the entire editor to avoid SSR issues
const RichTextEditor = dynamic(
  async () => {
    const { BlockNoteView } = await import("@blocknote/mantine");
    const { useCreateBlockNote } = await import("@blocknote/react");

    const BlockNoteEditorComponent = ({
      initialContent,
      onChange,
      readOnly = false,
      className = "",
    }: RichTextEditorProps) => {
      const { resolvedTheme } = useTheme();
      const [customTheme, setCustomTheme] = useState<Theme | null>(null);
      const [isMounted, setIsMounted] = useState(false);

      const editor = useCreateBlockNote({
        initialContent,
      });

      // Track when component is mounted
      useEffect(() => {
        setIsMounted(true);
      }, []);

      // Set up theme based on dark/light mode
      useEffect(() => {
        if (!isMounted) return;

        const timer = setTimeout(() => {
          const isDarkMode = resolvedTheme === "dark";
          setCustomTheme(createCustomTheme(isDarkMode, isMounted));
        }, 50);

        return () => clearTimeout(timer);
      }, [resolvedTheme, isMounted]);

      return (
        <div className={`h-full w-full ${className}`}>
          <BlockNoteView
            editor={editor}
            theme={customTheme || undefined}
            className="custom-blocknote"
            editable={!readOnly}
            onChange={onChange}
          />
        </div>
      );
    };

    return BlockNoteEditorComponent;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-background animate-pulse"></div>
    ),
  }
);

export default RichTextEditor;
