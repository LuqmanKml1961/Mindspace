import { toast } from "@/components/ui/toast";

type ToastAction = { label: string; onClick: () => void };

// App-wide feedback as toasts (<Toaster> in the root layout). Success is brief and announced
// politely, and can offer one action, such as Undo, which also closes it. A failed action stays
// until it is closed and is announced right away, so it isn't missed; the typed text always
// stays where it was. Errors about a field stay next to it.
export const notify = {
  success: (title: string, action?: ToastAction) => {
    let id = "";
    id = toast.add({
      title,
      type: "success",
      ...(action && {
        actionProps: {
          children: action.label,
          onClick: () => {
            toast.close(id);
            action.onClick();
          },
        },
      }),
    });
    return id;
  },
  error: (title: string) =>
    toast.add({ title, type: "error", timeout: 0, priority: "high" }),
};
