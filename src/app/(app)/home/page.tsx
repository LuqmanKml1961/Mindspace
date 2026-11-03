import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Take a breath.
        </h1>
        <p className="text-lg text-muted-foreground">
          You don’t have to figure everything out right now.
        </p>
      </header>
      <div>
        <Link href="/thoughts" className={buttonVariants({ size: "lg" })}>
          Brain Dump
        </Link>
      </div>
    </>
  );
}
