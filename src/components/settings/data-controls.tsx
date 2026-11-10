"use client";

import { Delete02Icon, Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/(app)/settings/actions";
import type { AccountExport } from "@/application/account/export";
import {
  DELETE_ACCOUNT_WORD,
  deleteAccountConfirmationSchema,
} from "@/application/account/schemas";
import { accountUseCases } from "@/components/settings/account-use-cases";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { deviceKeys } from "@/infrastructure/browser";
import { errorMessage, unwrap } from "@/lib/action-errors";
import { notify } from "@/lib/notify";

function download(data: AccountExport) {
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mindspace-export-${data.exportedAt.slice(0, 10)}.json`;
  link.click();
  // Released later: some browsers read the file after the click returns.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Spec §14: a copy of everything, and deleting the account with all of it (P6.5).
export function DataControls({ userId }: { userId: string }) {
  const router = useRouter();
  const [exporting, startExport] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const confirmed = deleteAccountConfirmationSchema.safeParse(typed).success;

  function exportData() {
    startExport(async () => {
      try {
        download(
          await accountUseCases.exportAccount({ userId, now: new Date() }),
        );
        notify.success("Your data is downloading.");
      } catch (cause) {
        notify.error(errorMessage(cause));
      }
    });
  }

  function deleteAccount() {
    startDelete(async () => {
      try {
        unwrap(await deleteAccountAction(typed));
      } catch (cause) {
        setConfirming(false);
        notify.error(errorMessage(cause));
        return;
      }
      // The account is gone and this browser is signed out; the device forgets its key too.
      await deviceKeys.forget().catch(() => undefined);
      notify.success("Your account and everything in it have been deleted.");
      router.replace("/sign-in");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={exporting}
            onClick={exportData}
          >
            {exporting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={Download04Icon}
                strokeWidth={2}
                data-icon="inline-start"
                aria-hidden="true"
              />
            )}
            Export my data
          </Button>
        </div>
        <FieldDescription>
          A readable file of everything you’ve saved, decrypted on this device.
          It isn’t encrypted, so keep it somewhere safe.
        </FieldDescription>
      </Field>
      <Separator />
      <AlertDialog
        open={confirming}
        onOpenChange={(open) => {
          setConfirming(open);
          if (!open) setTyped("");
        }}
      >
        <div>
          <AlertDialogTrigger
            render={
              <Button type="button" variant="destructive">
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Delete my account
              </Button>
            }
          />
        </div>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <HugeiconsIcon
                icon={Delete02Icon}
                strokeWidth={2}
                aria-hidden="true"
              />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your account and everything in it: thoughts,
              categories, tasks, reminders and check-ins, on every device. It
              can’t be undone. Export your data first if you want a copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-account-confirmation">
              Type “{DELETE_ACCOUNT_WORD}” to confirm
            </FieldLabel>
            <Input
              id="delete-account-confirmation"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={deleting}
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" disabled={deleting}>
              Keep my account
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!confirmed || deleting}
              onClick={deleteAccount}
            >
              {deleting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              )}
              Delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
