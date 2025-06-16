"use client";

import { BlockNoteView, Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/blocknote-custom.css";

// Create a custom BlockNote theme with hardcoded values
const createCustomTheme = (isDarkMode: boolean): Theme => {
  // Using hardcoded values to ensure proper rendering
  const lightColors = {
    editor: {
      text: "#1a1a1a", // Dark text for light mode
      background: "#ffffff", // White background for light mode
    },
    menu: {
      text: "#1a1a1a",
      background: "#ffffff",
    },
    tooltip: {
      text: "#1a1a1a",
      background: "#ffffff",
    },
    hovered: {
      text: "#1a1a1a",
      background: "#f0f0f0",
    },
    selected: {
      text: "#ffffff",
      background: "#7c3aed", // Purple primary color
    },
    disabled: {
      text: "#888888",
      background: "#f0f0f0",
    },
    shadow: "rgba(0, 0, 0, 0.1)",
    border: "#e2e2e2",
    sideMenu: "#7c3aed", // Purple primary color
  };

  const darkColors = {
    editor: {
      text: "#f0f0f0", // Light text for dark mode
      background: "#1a1a1a", // Dark background for dark mode
    },
    menu: {
      text: "#f0f0f0",
      background: "#2a2a2a",
    },
    tooltip: {
      text: "#f0f0f0",
      background: "#2a2a2a",
    },
    hovered: {
      text: "#f0f0f0",
      background: "#3a3a3a",
    },
    selected: {
      text: "#ffffff",
      background: "#9d65fb", // Lighter purple for dark mode
    },
    disabled: {
      text: "#888888",
      background: "#3a3a3a",
    },
    shadow: "rgba(0, 0, 0, 0.3)",
    border: "#444444",
    sideMenu: "#9d65fb", // Lighter purple for dark mode
  };

  return {
    colors: isDarkMode ? darkColors : lightColors,
    borderRadius: 16, // Use a numeric value instead of CSS variable
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
  const [mounted, setMounted] = useState(false);

  // Call the hook at the top level of the component
  // This is safe because null will be used during SSR
  // and the real editor will only be used client-side after mounting
  const editor =
    typeof window !== "undefined"
      ? useCreateBlockNote({ initialContent })
      : null;

  // Handle mounting state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up theme based on dark/light mode
  useEffect(() => {
    if (!mounted) return;

    // Use resolvedTheme instead of theme to properly handle 'system' preference
    const isDarkMode = resolvedTheme === "dark";
    setCustomTheme(createCustomTheme(isDarkMode));
  }, [resolvedTheme, mounted]);

  // Set up onChange handler if provided
  useEffect(() => {
    if (onChange && editor) {
      // Subscribe to editor changes
      const unsubscribe = editor.onChange(() => {
        if (onChange) {
          onChange(editor);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [editor, onChange]);

  // Don't render until component is mounted to avoid hydration issues
  if (!mounted) {
    return <div className={`h-full w-full bg-background ${className}`}></div>;
  }

  // Get current theme
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className={`h-full w-full ${className}`}>
      {mounted && customTheme && editor && (
        <BlockNoteView
          editor={editor}
          theme={customTheme}
          className="custom-blocknote"
          editable={!readOnly}
          style={{
            // Typography adjustments
            fontSize: "1rem",
            lineHeight: "1.5",
            // Adjusting min height for better UX
            minHeight: "calc(100vh - 2rem)",
            // Ensure correct background and text color
            backgroundColor: "transparent",
            color: isDarkMode ? "#f0f0f0" : "#1a1a1a",
          }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
