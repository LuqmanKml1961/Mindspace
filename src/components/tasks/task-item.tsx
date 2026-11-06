import Link from "next/link";
import { formatCaptured } from "@/components/thoughts/thought-status";
import { dueLabel, priorityLabels } from "@/components/tasks/task-views";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { Task } from "@/domain/tasks/task";

// One decrypted task as a card: on Tasks it opens the edit sheet, on Home it links to Tasks.
// Normal priority shows no badge. Inside a card it takes the page colour (DESIGN.md §3).
export function TaskItem({
  task,
  today,
  ...target
}: {
  task: Task;
  today: string;
} & ({ onOpen: () => void } | { href: string })) {
  const due = dueLabel(task, today);
  return (
    <Item
      variant="outline"
      className="flex-1 text-left hover:bg-muted in-data-[slot=card]:bg-background"
      render={
        "href" in target ? (
          <Link href={target.href} />
        ) : (
          <button type="button" onClick={target.onOpen} />
        )
      }
    >
      <ItemContent>
        <ItemTitle>{task.title}</ItemTitle>
        {task.completedAt ? (
          <ItemDescription>
            Completed {formatCaptured(task.completedAt)}
          </ItemDescription>
        ) : (
          due && <ItemDescription>{due}</ItemDescription>
        )}
      </ItemContent>
      {task.priority !== "normal" && (
        <Badge variant={task.priority === "high" ? "secondary" : "outline"}>
          {priorityLabels[task.priority]}
        </Badge>
      )}
    </Item>
  );
}
