import { recapGroups } from "@/components/clarity/check-in-prompts";
import type { DailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type { Task } from "@/domain/tasks/task";

export type Summary = {
  groups: { title: string; description?: string; answers: string[] }[];
  priority: string | null;
};

// A check-in's answers grouped, so what can be acted on now stands apart from what can wait
// (P5.4), and its one thing: written words, or the chosen task's title. Skipped questions and
// empty groups are left out.
export function summarise(checkIn: DailyCheckIn, tasks: Task[]): Summary {
  return {
    groups: recapGroups
      .map(({ title, description, prompts }) => ({
        title,
        description,
        answers: prompts
          .map((prompt) => checkIn[prompt])
          .filter((answer) => answer !== null),
      }))
      .filter((group) => group.answers.length > 0),
    priority:
      checkIn.priorityText ??
      tasks.find((task) => task.id === checkIn.priorityTaskId)?.title ??
      null,
  };
}

// Today's recap and past reflections show a summary the same way.
export function CheckInSummary({
  summary,
  priorityTitle,
}: {
  summary: Summary;
  priorityTitle: string;
}) {
  return (
    <>
      {summary.groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-medium">{group.title}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {group.answers.map((answer, index) => (
              <li key={index} className="break-words whitespace-pre-wrap">
                {answer}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {summary.priority !== null && (
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">{priorityTitle}</h3>
          <p className="break-words whitespace-pre-wrap">{summary.priority}</p>
        </section>
      )}
    </>
  );
}
