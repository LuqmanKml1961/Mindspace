import type { CheckInPrompt } from "@/domain/check-ins/daily-check-in";

// Spec §4.6, word for word.
export const promptQuestions: Record<CheckInPrompt, string> = {
  occupyingMind: "What is occupying your mind?",
  worries: "What are you worried about?",
  canControl: "What can you control?",
  canWait: "What can wait until tomorrow?",
  smallHelpfulThing: "What is one small thing that would help?",
};

// Spec §4.7, in the calm wording of DESIGN.md §8.
export const priorityQuestion = "What’s the one thing you’d like to focus on?";

// The recap separates what can be acted on now from what can wait (P5.4).
export const recapGroups: {
  title: string;
  description?: string;
  prompts: CheckInPrompt[];
}[] = [
  { title: "On your mind", prompts: ["occupyingMind", "worries"] },
  {
    title: "Within your control",
    description: "What you can act on now.",
    prompts: ["canControl", "smallHelpfulThing"],
  },
  {
    title: "Can wait",
    description: "Until tomorrow, or later.",
    prompts: ["canWait"],
  },
];
