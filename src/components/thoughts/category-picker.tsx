"use client";

import { useState, useTransition } from "react";
import { brainDump, errorMessage } from "@/components/thoughts/brain-dump";
import { SUGGESTED_CATEGORY_NAMES } from "@/components/thoughts/category-suggestions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { isSameCategoryName, type Category } from "@/domain/thoughts/category";
import { notify } from "@/lib/notify";

const NEW = "new";
const SUGGESTION = "suggestion:";

// Pick a category, or create one in place: a suggestion or a new name is created right away
// (encrypted on this device) and selected. Duplicate names are caught here (D-021).
export function CategoryPicker({
  userId,
  categories,
  value,
  disabled,
  onChange,
  onCreated,
}: {
  userId: string;
  categories: Category[];
  value: string | null;
  disabled: boolean;
  onChange: (categoryId: string | null) => void;
  onCreated: (category: Category) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const suggestions = SUGGESTED_CATEGORY_NAMES.filter(
    (suggestion) =>
      !categories.some((category) =>
        isSameCategoryName(category.name, suggestion),
      ),
  );

  function create(newName: string) {
    startTransition(async () => {
      try {
        const category = await brainDump.createCategory({
          userId,
          name: newName,
          existing: categories,
        });
        onCreated(category);
        setAdding(false);
        setName("");
        setError(undefined);
        notify.success(`Added “${category.name}”.`);
      } catch (cause) {
        setError(errorMessage(cause));
      }
    });
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="category">Category</FieldLabel>
      <NativeSelect
        id="category"
        className="w-full"
        value={adding ? NEW : (value ?? "")}
        disabled={disabled || pending}
        onChange={(event) => {
          const choice = event.target.value;
          setError(undefined);
          setAdding(choice === NEW);
          if (choice === NEW) return;
          if (choice.startsWith(SUGGESTION)) {
            create(choice.slice(SUGGESTION.length));
          } else {
            onChange(choice || null);
          }
        }}
      >
        <NativeSelectOption value="">No category</NativeSelectOption>
        {categories.length > 0 && (
          <NativeSelectOptGroup label="Your categories">
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        )}
        {suggestions.length > 0 && (
          <NativeSelectOptGroup label="Suggestions">
            {suggestions.map((suggestion) => (
              <NativeSelectOption
                key={suggestion}
                value={`${SUGGESTION}${suggestion}`}
              >
                {suggestion}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        )}
        <NativeSelectOption value={NEW}>New category…</NativeSelectOption>
      </NativeSelect>
      {adding && (
        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroupInput
              aria-label="New category name"
              autoFocus
              value={name}
              readOnly={pending}
              aria-invalid={error ? true : undefined}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                // The picker sits inside the thought form: Enter adds the category instead.
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (name.trim()) create(name);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                size="sm"
                disabled={pending || !name.trim()}
                onClick={() => create(name)}
              >
                {pending && <Spinner data-icon="inline-start" />}
                Add
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setAdding(false);
              setName("");
              setError(undefined);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      {pending && !adding && (
        <FieldDescription>Adding the category…</FieldDescription>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
