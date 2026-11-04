import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ThoughtNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          <h1>This thought isn’t here</h1>
        </EmptyTitle>
        <EmptyDescription>
          It may have been deleted, or the link is incomplete.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/thoughts" className={buttonVariants()}>
          Back to Brain Dump
        </Link>
      </EmptyContent>
    </Empty>
  );
}
