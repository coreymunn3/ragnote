"use client";

import dynamic from "next/dynamic";
import "@blocknote/mantine/style.css";
import { BlockNoteEditor } from "@blocknote/core";
import type { Theme } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatedContainer } from "@/components/animations/AnimatedContainer";
import { LockIcon, Trash2, Trash2Icon, WrapText } from "lucide-react";
import EditorSkeleton from "./skeletons/EditorSkeleton";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { createHighlighter } from "@/lib/shiki.bundle";
import { Button } from "./ui/button";
import { RemoveBlockButton } from "./RemoveBlockButton";

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
    const {
      useCreateBlockNote,
      SideMenu,
      SideMenuController,
      AddBlockButton,
      getDefaultReactSlashMenuItems,
      SuggestionMenuController,
    } = await import("@blocknote/react");
    const { filterSuggestionItems, BlockNoteSchema } = await import(
      "@blocknote/core"
    );
    const { createCodeBlockSpec } = await import("@blocknote/core");
    const { IndentDecrease, IndentIncrease } = await import("lucide-react");

    // Custom Slash Menu item for Indent
    const indentItem = (editor: BlockNoteEditor) => ({
      title: "Indent",
      onItemClick: () => {
        if (editor.canNestBlock()) {
          editor.nestBlock();
        }
      },
      aliases: ["indent", "tab", "increase indent"],
      group: "Formatting",
      icon: <IndentIncrease size={18} />,
      subtext: "Increase block indentation",
    });

    // Custom Slash Menu item for Outdent
    const outdentItem = (editor: BlockNoteEditor) => ({
      title: "Outdent",
      onItemClick: () => {
        if (editor.canUnnestBlock()) {
          editor.unnestBlock();
        }
      },
      aliases: ["outdent", "unindent", "decrease indent"],
      group: "Formatting",
      icon: <IndentDecrease size={18} />,
      subtext: "Decrease block indentation",
    });

    // Custom slash menu item for Newline (in a table)
    const newlineItem = (editor: BlockNoteEditor) => ({
      title: "New Line",
      onItemClick: () => {
        editor.insertInlineContent("\n");
      },
      aliases: ["newline", "line break"],
      group: "Formatting",
      icon: <WrapText size={18} />,
      subtext: "Insert a line break",
    });

    // Combine default items with custom indent/outdent items
    const getCustomSlashMenuItems = (editor: BlockNoteEditor) => [
      ...getDefaultReactSlashMenuItems(editor),
      indentItem(editor),
      outdentItem(editor),
      newlineItem(editor),
    ];

    const BlockNoteEditorComponent = ({
      initialContent,
      onChange,
      readOnly = false,
      className = "",
    }: RichTextEditorProps) => {
      const { resolvedTheme } = useTheme();
      const [customTheme, setCustomTheme] = useState<Theme | null>(null);
      const [isMounted, setIsMounted] = useState(false);
      const isOnline = useOnlineStatus();

      // Skip first onChange event (BlockNote fires it during initialization)
      const isFirstChange = useRef(true);

      // If offline, force read-only mode
      const isReadOnly = readOnly || !isOnline;

      const editor = useCreateBlockNote({
        initialContent,
        schema: BlockNoteSchema.create().extend({
          blockSpecs: {
            codeBlock: createCodeBlockSpec({
              indentLineWithTab: true,
              defaultLanguage: "typescript",
              supportedLanguages: {
                javascript: { name: "JavaScript", aliases: ["js"] },
                typescript: { name: "TypeScript", aliases: ["ts"] },
                python: { name: "Python", aliases: ["py"] },
                java: { name: "Java" },
                css: { name: "CSS" },
                html: { name: "HTML" },
                json: { name: "JSON" },
                markdown: { name: "Markdown", aliases: ["md"] },
                bash: { name: "Bash", aliases: ["sh", "shell"] },
                sql: { name: "SQL" },
              },
              createHighlighter: () =>
                createHighlighter({
                  themes: ["light-plus", "dark-plus"],
                  langs: [],
                }) as any,
            }),
          },
        }),
      });

      // Track when component is mounted
      useEffect(() => {
        setIsMounted(true);
      }, []);

      /**
       * This useEffect ensures the RichTextEditor theme dark/light mode gets updated when the overall app theme gets updated
       * I've found that putting it on a very small timer is necessary to ensure we are successfully setting it due to the asynchronous nature of setState
       * without the timer, I oberseved that when you changed the app theme, the rich text editor theme would not seem to update, and text was unreadable.
       */
      useEffect(() => {
        if (!isMounted) return;

        const timer = setTimeout(() => {
          const isDarkMode = resolvedTheme === "dark";
          setCustomTheme(createCustomTheme(isDarkMode, isMounted));
        }, 20);

        return () => clearTimeout(timer);
      }, [resolvedTheme, isMounted]);

      return (
        <div className={`h-full w-full ${className} relative`}>
          <div className={`${isReadOnly && "bg-muted"} rounded-md relative`}>
            {isReadOnly && (
              <AnimatedContainer withPresence>
                <div className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-muted dark:bg-muted rounded-t-md">
                  <LockIcon className="h-3.5 w-3.5 text-muted-foreground dark:text-white" />
                  <span className="text-xs text-muted-foreground dark:text-white">
                    {readOnly ? "Read Only" : "Read Only (Offline)"}
                  </span>
                </div>
              </AnimatedContainer>
            )}
            <BlockNoteView
              editor={editor}
              sideMenu={false}
              slashMenu={false}
              theme={customTheme || undefined}
              editable={!isReadOnly}
              onChange={() => {
                // Skip the first onChange event (fires on mount)
                if (isFirstChange.current) {
                  isFirstChange.current = false;
                  return;
                }
                onChange?.(editor);
              }}
            >
              <SideMenuController
                sideMenu={(props) => (
                  <SideMenu {...props}>
                    <div className="flex flex-col md:flex-row ">
                      <AddBlockButton />
                      <RemoveBlockButton />
                    </div>
                  </SideMenu>
                )}
              />
              <SuggestionMenuController
                triggerCharacter={"/"}
                getItems={async (query) => {
                  const items = getCustomSlashMenuItems(editor as any) as any;
                  return filterSuggestionItems(items, query) as any;
                }}
                suggestionMenuComponent={undefined as any}
                onItemClick={undefined as any}
              />
            </BlockNoteView>
          </div>
        </div>
      );
    };

    return BlockNoteEditorComponent;
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <EditorSkeleton />
      </div>
    ),
  },
);

export default RichTextEditor;
