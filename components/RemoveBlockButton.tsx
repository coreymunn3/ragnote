import {} from "@blocknote/core";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  useBlockNoteEditor,
  useComponentsContext,
  useExtensionState,
} from "@blocknote/react";
import { Trash2Icon } from "lucide-react";

// Custom Side Menu button to remove the hovered block.
export function RemoveBlockButton() {
  const editor = useBlockNoteEditor();

  const Components = useComponentsContext()!;

  const block = useExtensionState(SideMenuExtension, {
    selector: (state) => state?.block,
  });

  if (!block) {
    return null;
  }

  return (
    <Components.SideMenu.Button
      label="Remove block"
      icon={
        <Trash2Icon
          size={"sm"}
          className="h-2 w-2"
          onClick={() => {
            editor.removeBlocks([block]);
          }}
        />
      }
    />
  );
}
