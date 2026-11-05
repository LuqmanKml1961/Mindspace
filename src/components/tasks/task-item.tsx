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

// One decrypted task as a card that opens the edit sheet. Normal priority shows no badge.
export function TaskItem({
  task,
  today,
  onOpen,
}: {
  task: Task;
  today: string;
  onOpen: () => void;
}) {
  const due = dueLabel(task, today);
  return (
    <Item
      variant="outline"
      className="flex-1 text-left hover:bg-muted"
      render={<button type="button" onClick={onOpen} />}
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
