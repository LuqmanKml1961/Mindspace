import Link from "next/link";
import {
  formatCaptured,
  statusLabels,
} from "@/components/thoughts/thought-status";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { Thought } from "@/domain/thoughts/thought";

// One decrypted thought as a card linking to its page (Brain Dump and Home).
export function ThoughtItem({
  thought,
  categoryName,
  showStatus = false,
}: {
  thought: Thought;
  categoryName?: string;
  showStatus?: boolean;
}) {
  return (
    <Item variant="outline" render={<Link href={`/thoughts/${thought.id}`} />}>
      <ItemContent>
        <ItemTitle>{thought.title ?? thought.content}</ItemTitle>
        {thought.title && <ItemDescription>{thought.content}</ItemDescription>}
        <ItemDescription>
          <time dateTime={thought.createdAt.toISOString()}>
            {formatCaptured(thought.createdAt)}
          </time>
        </ItemDescription>
      </ItemContent>
      {showStatus && (
        <Badge variant="outline">{statusLabels[thought.status]}</Badge>
      )}
      {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
    </Item>
  );
}
