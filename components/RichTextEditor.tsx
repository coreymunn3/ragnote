"use client";

import { BlockNoteView, Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
// an example of how to use custom css to change blocknote appearance
// import "../styles/blocknote-custom.css";

// Utility function to get CSS variable value
const getCssVar = (name: string): string => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

// Convert HSL variable to color
const hslFromVar = (varName: string): string => {
  const value = getCssVar(varName);
  return value ? `hsl(${value})` : "";
};

// Create a custom BlockNote theme using CSS variables
const createCustomTheme = (isDarkMode: boolean): Theme => {
  // Single colors object using CSS variables that already respond to theme
  const colors = {
    editor: {
      text: hslFromVar("--foreground"),
      background: hslFromVar("--background"),
    },
    menu: {
      text: hslFromVar("--foreground"),
      background: hslFromVar("--background"),
    },
    tooltip: {
      text: hslFromVar("--foreground"),
      background: hslFromVar("--popover"),
    },
    hovered: {
      text: hslFromVar("--foreground"),
      background: hslFromVar("--secondary"),
    },
    selected: {
      text: hslFromVar("--primary-foreground"),
      background: hslFromVar("--primary"),
    },
    disabled: {
      text: hslFromVar("--muted-foreground"),
      background: hslFromVar("--muted"),
    },
    // Keep shadow different based on theme
    shadow: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)",
    border: hslFromVar("--border"),
    sideMenu: hslFromVar("--primary"),
  };

  return {
    colors: colors,
    borderRadius: 16,
    fontFamily: "var(--font-sans)",
  };
};

export interface RichTextEditorProps {
  initialContent?: any; // BlockNote JSON content
  onChange?: (editor: BlockNoteEditor) => void;
  readOnly?: boolean;
  className?: string;
}

const RichTextEditor = ({
  initialContent,
  onChange,
  readOnly = false,
  className = "",
}: RichTextEditorProps) => {
  const { resolvedTheme } = useTheme();
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);

  const editor = useCreateBlockNote({
    initialContent,
  });

  // Set up theme based on dark/light mode with a delay to ensure CSS variables are updated
  useEffect(() => {
    if (!editor) return;
    // Add a small delay to ensure CSS variables have been updated after theme change
    const timer = setTimeout(() => {
      // Use resolvedTheme instead of theme to properly handle 'system' preference
      const isDarkMode = resolvedTheme === "dark";
      setCustomTheme(createCustomTheme(isDarkMode));
    }, 10); // 100ms delay should be sufficient

    // Cleanup timeout on unmount or before running effect again
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  // Don't render until component is mounted to avoid hydration issues
  if (!editor) {
    return <div className={`h-full w-full bg-background ${className}`}></div>;
  }

  return (
    <div className={`h-full w-full ${className}`}>
      {customTheme && editor && (
        <BlockNoteView
          editor={editor}
          theme={customTheme}
          className="custom-blocknote"
          editable={!readOnly}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
