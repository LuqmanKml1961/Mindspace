import { toast } from "@/components/ui/toast";

// App-wide feedback as toasts (<Toaster> in the root layout). Success is brief and announced
// politely. A failed action stays until it is closed and is announced right away, so it isn't
// missed; the typed text always stays where it was. Errors about a field stay next to it.
export const notify = {
  success: (title: string) => toast.add({ title, type: "success" }),
  error: (title: string) =>
    toast.add({ title, type: "error", timeout: 0, priority: "high" }),
};
