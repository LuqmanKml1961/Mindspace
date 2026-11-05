import { FieldDescription } from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

// The save shortcut, shown from md up, where a keyboard is likely.
export function SaveShortcut() {
  return (
    <FieldDescription className="hidden md:block">
      Save with{" "}
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
      , or{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>{" "}
      on a Mac.
    </FieldDescription>
  );
}
