import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ValidationError } from "@/domain/shared/errors";

// The domain's own message when a rule is broken, or undefined.
export function validationMessage(check: () => unknown): string | undefined {
  try {
    check();
    return undefined;
  } catch (error) {
    return error instanceof ValidationError ? error.message : undefined;
  }
}

type FormFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
};

export function FormField({
  id,
  label,
  description,
  error,
  ...inputProps
}: FormFieldProps) {
  const invalid = error ? true : undefined;
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name={id} aria-invalid={invalid} {...inputProps} />
      {description && !error && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function FormMessages({
  error,
  notice,
}: {
  error?: string;
  notice?: string;
}) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (notice) {
    return (
      <Alert>
        <AlertDescription>{notice}</AlertDescription>
      </Alert>
    );
  }
  return null;
}

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pending: boolean;
  // Lets a form with two submit buttons show the spinner on the one that was pressed.
  spinner?: boolean;
};

export function SubmitButton({
  pending,
  spinner = true,
  disabled,
  children,
  ...buttonProps
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending || disabled} {...buttonProps}>
      {pending && spinner && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  );
}
