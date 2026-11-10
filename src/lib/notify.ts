import { toast } from "@/components/ui/toast";

type ToastAction = { label: string; onClick: () => void };

// App-wide feedback as toasts (<Toaster> in the root layout). Success is brief and announced
// politely, and can offer one action, such as Undo, which also closes it. A failed action stays
// until it is closed and is announced right away, so it isn't missed; the typed text always
// stays where it was. A notice (being offline, a new version) stays until it is closed, by you
// or by the app, and is announced politely. Errors about a field stay next to it.
export const notify = {
  success: (title: string, action?: ToastAction) =>
    show({ title, type: "success" }, action),
  error: (title: string) =>
    toast.add({ title, type: "error", timeout: 0, priority: "high" }),
  notice: (title: string, action?: ToastAction) =>
    show({ title, type: "info", timeout: 0 }, action),
  close: (id: string) => toast.close(id),
};

function show(
  options: { title: string; type: string; timeout?: number },
  action?: ToastAction,
) {
  let id = "";
  id = toast.add({
    ...options,
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
}
