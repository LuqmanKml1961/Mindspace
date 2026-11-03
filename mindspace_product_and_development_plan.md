# Mindspace --- Product Concept & Development Plan

> **Working name:** Mindspace\
> **Tagline:** Your mind has enough to think about.\
> **Product type:** Progressive Web App (PWA)\
> **Purpose:** Help people externalise thoughts, organise everyday
> responsibilities, and reduce the feeling of mental clutter.

------------------------------------------------------------------------

## 1. Product vision

Mindspace is a personal thinking and organisation companion for people
who experience racing thoughts, forgetfulness, mental overload,
difficulty organising ideas, or a tendency to speak before their
thoughts are fully organised.

The central philosophy is:

**Your brain should be used to think, not to remember everything.**

Mindspace is not intended to turn people into productivity machines. It
should give users a reliable place to capture thoughts, decide what
needs attention, and let less urgent things wait.

The product should accommodate different ways of thinking rather than
expecting everyone to work in the same way.

### Important positioning

-   Position Mindspace as a personal organisation and mental-wellbeing
    tool.
-   Do not claim to diagnose, treat, or cure anxiety, ADHD, or any other
    medical condition.
-   Avoid assuming that every user with these experiences has a
    particular diagnosis.
-   Keep personal thoughts and recordings private by default.

## 2. Target audience

Potential users include people who:

-   Overthink or experience racing thoughts.
-   Forget tasks, ideas, or things they intended to do.
-   Feel mentally overloaded.
-   Jump between ideas or struggle to organise their thoughts.
-   Speak quickly and want to communicate more clearly.
-   Want a calmer, simpler way to manage everyday responsibilities.
-   Need somewhere to capture thoughts before they lose them.

The initial product should be built around the founder's own
experiences, then tested with a small group of people who recognise
similar challenges.

## 3. Product principles

1.  **Capture first, organise later.** Saving a thought should take only
    a few seconds.
2.  **Low cognitive load.** Avoid cluttered dashboards, excessive
    settings, and unnecessary decisions.
3.  **No guilt-based productivity.** No punishment for missing a day or
    breaking a streak.
4.  **One thing at a time.** Help users identify a manageable next step.
5.  **Privacy first.** Personal notes, recordings, and reflections are
    sensitive.
6.  **Notifications should be useful.** Do not create more mental noise.
7.  **Accessible everywhere.** Users should be able to open the app
    through a web link, without installing a traditional app.
8.  **Support, don't judge.** Use neutral, encouraging language rather
    than productivity pressure.

------------------------------------------------------------------------

## 4. Core features

The following seven feature areas form the longer-term product vision.
They should not all be built at once.

### 4.1 Brain Dump

**Purpose:** Give users a fast way to get thoughts out of their heads.

Users can type or speak freely without having to organise the
information first.

Example input:

> "I need to fix that bug tomorrow, remember to buy groceries, maybe I
> should learn Docker, and I need to reply to Alaa."

The app could help identify separate items:

-   Work: Fix the bug tomorrow.
-   Personal: Buy groceries.
-   Learning: Learn Docker.
-   Communication: Reply to Alaa.

Potential functionality:

-   Text capture.
-   Voice capture and transcription.
-   Automatic or suggested categorisation.
-   Editing and deleting.
-   Search.
-   Convert a thought into a task or reminder.

AI categorisation should be optional and added only after the basic
capture experience is reliable.

### 4.2 Thought Parking

**Purpose:** Give unfinished ideas, questions, worries, and random
thoughts a place to stay.

Suggested categories:

-   Random thoughts.
-   Ideas.
-   Things to investigate.
-   Things to remember.
-   Future plans.

Users should be able to save something without deciding immediately what
to do with it.

### 4.3 Slow Down Mode

**Purpose:** Offer a short reset when the user feels mentally
overloaded.

Possible experience:

-   A short guided breathing exercise.
-   A prompt to focus on one thought.
-   A question such as, "What is actually bothering you right now?"
-   A distinction between what the user can control and what can wait.
-   A short pause before choosing an action.

This should be a quick reset, not an elaborate meditation programme or a
substitute for professional care.

### 4.4 Conversation Mode

**Purpose:** Help users become more aware of their speaking pace and
communicate more clearly.

Possible functionality:

-   Record a short speaking sample.
-   Calculate approximate words per minute.
-   Show pauses and speaking duration.
-   Provide a transcript.
-   Offer suggestions for clearer sentence structure.
-   Provide short communication exercises.

The goal is not to force users to speak unnaturally slowly. It is to
help them communicate at a pace that feels clear and comfortable.

### 4.5 Don't Forget

**Purpose:** Provide an external memory for tasks and reminders.

Possible functionality:

-   Capture a reminder quickly.
-   Add a due date and time.
-   Set priority.
-   Resurface unfinished tasks.
-   Show upcoming tasks in a daily overview.
-   Provide a morning review.

Avoid turning this into a complicated project-management tool.

### 4.6 Mind Clarity

**Purpose:** Help users reflect on what is occupying their minds and
recognise patterns.

Possible daily check-in prompts:

-   What is occupying your mind?
-   What are you worried about?
-   What can you control?
-   What can wait until tomorrow?
-   What is one small thing that would help?

Over time, users may be able to review their own reflections and notice
recurring themes. Do not present these observations as medical
assessments.

### 4.7 One Thing at a Time

**Purpose:** Reduce the feeling of being overwhelmed by too many tasks.

Instead of showing every outstanding item as equally urgent, highlight
one manageable priority.

Example prompt:

> "What's the one thing you should focus on right now?"

Other tasks remain saved and accessible. The feature should help users
prioritise, not hide important information.

------------------------------------------------------------------------

## 5. Initial MVP scope

Do not build all seven feature areas immediately.

The recommended first version contains three core modules:

### Module 1 --- Brain Dump

-   Create a thought using text.
-   View saved thoughts.
-   Edit and delete thoughts.
-   Add a category or tag.
-   Search thoughts.
-   Convert a thought into a task.

### Module 2 --- External Memory

-   Create and manage tasks.
-   Set due dates.
-   Set priority.
-   Mark tasks complete.
-   Create reminders.
-   View today's and upcoming tasks.

### Module 3 --- Mind Clarity

-   Complete a simple daily check-in.
-   Record what is occupying the user's mind.
-   Identify what can be acted on and what can wait.
-   Select one priority for the day.

Voice transcription, AI categorisation, Conversation Mode, advanced
analytics, and more sophisticated notification workflows can follow once
the MVP is useful.

------------------------------------------------------------------------

## 6. Suggested user experience and navigation

The application should feel calm, minimal, and straightforward.

### Suggested main navigation

-   **Home:** A short daily overview and one priority.
-   **Inbox / Brain Dump:** Capture and review thoughts.
-   **Tasks:** Manage reminders and responsibilities.
-   **Mind Clarity:** Daily reflection and reset.
-   **Profile / Settings:** Account, privacy, preferences, and data
    controls.

### Example dashboard content

**Greeting:** "Take a breath."

**Supporting message:** "You don't have to figure everything out right
now."

**Your mind, right now:** - Show a small number of recently captured
thoughts. - Indicate how many items are waiting for review. - Avoid
making every item look urgent.

**Primary action:** "Brain Dump"

**Secondary actions:** - Mind Clarity. - My Priorities. - Upcoming
Reminders.

### Visual direction

Recommended direction:

-   Minimalist, calm, and modern.
-   Generous spacing.
-   Clear typography and readable text sizes.
-   Restrained colour palette.
-   Soft neutral surfaces with one or two accent colours.
-   Simple icons.
-   Responsive layouts for mobile and desktop.
-   Light and dark themes can be added when useful.

Avoid dense dashboards, excessive charts, streak counters, gamification,
and visually noisy notifications.

------------------------------------------------------------------------

## 7. Technology stack

The goal is to build a low-cost PWA using technologies that are
straightforward to maintain.

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + TypeScript    Application and routing

  Styling                 Tailwind CSS            Layout and styling

  UI components           shadcn/ui               Reusable interface
                                                  components

  PWA                     Web App Manifest +      Installable web
                          Service Worker          experience and offline
                                                  capabilities

  Database                Supabase PostgreSQL     Store user data

  Authentication          Supabase Auth           User accounts and
                                                  sessions

  Storage                 Supabase Storage        Optional recordings and
                                                  attachments

  Server-side functions   Supabase Edge Functions Protected server
                          or Next.js server-side  operations and future
                          code                    AI calls

  Version control         GitHub                  Source control

  Hosting                 Cloudflare or Vercel    Deployment
  -----------------------------------------------------------------------

### Why Supabase initially?

Supabase provides PostgreSQL, authentication, storage, and APIs in one
service. This avoids having to maintain a separate backend and database
server at the beginning.

A separate C# ASP.NET Core API is not necessary for the first version.
It can be introduced later if the product develops requirements that
justify it.

### Hosting considerations

-   Use a free hosting tier for development and early testing where the
    provider's terms allow it.
-   Check current limits, commercial-use terms, bandwidth, build limits,
    and database restrictions before public launch.
-   Vercel Hobby is intended for personal, non-commercial use; review
    its terms before using it for a commercial product.
-   Cloudflare Pages may be another hosting option, depending on the
    Next.js features and deployment architecture selected.
-   A custom domain is optional during development.

Free tiers can have limitations such as paused projects, limited
backups, quotas, or usage caps. Do not assume that a free tier is
suitable for a growing production service.

------------------------------------------------------------------------

## 8. High-level architecture

``` text
User devices
Desktop / Android / iPhone
          |
          v
Mindspace PWA
Next.js + TypeScript
Tailwind CSS + shadcn/ui
          |
          v
Application services
Authentication / validation / business logic
          |
          v
Supabase
  |-- PostgreSQL
  |-- Authentication
  |-- Storage
  |-- Edge Functions
          |
          v
Optional external services
Speech-to-text / AI categorisation / notifications
```

### Architecture principles

-   Keep the first version simple.
-   Use server-side operations for secrets and privileged actions.
-   Never expose service-role keys or private API keys in browser code.
-   Enforce user-level access using Supabase Row Level Security (RLS).
-   Validate data on the server as well as in the UI.
-   Keep AI calls behind protected server-side functions.
-   Avoid adding external services until there is a clear product need.

------------------------------------------------------------------------

## 9. Initial database design

Start with a small schema. Expand it as features are implemented.

  Table                Purpose
  -------------------- ------------------------------------------
  `profiles`           User preferences and profile information
  `thoughts`           Brain dumps and saved thoughts
  `tasks`              User tasks and priorities
  `reminders`          Scheduled reminders
  `categories`         Thought categories
  `daily_checkins`     Daily reflections
  `voice_recordings`   Recording metadata and transcription

Every user-owned record should be associated with a `user_id`.

### Example: thoughts table

``` sql
CREATE TABLE thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security requirements

Enable Row Level Security on all user-owned tables. Policies should
ensure that an authenticated user can only read, create, update, and
delete their own records.

Conceptual example:

``` sql
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own thoughts"
ON thoughts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own thoughts"
ON thoughts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thoughts"
ON thoughts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thoughts"
ON thoughts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

Apply equivalent policies to every other table containing personal
information. Test the policies with multiple accounts. Do not rely on
hiding UI elements as a security measure.

------------------------------------------------------------------------

## 10. PWA requirements

A Progressive Web App allows users to access Mindspace through a URL.
Users do not need to download it from an app store. On supported devices
and browsers, they may optionally add it to their home screen.

### Initial PWA requirements

-   Valid web app manifest.
-   Application name and short name.
-   App icons in appropriate sizes.
-   Theme and background colours.
-   Start URL.
-   Display mode, such as `standalone`.
-   HTTPS deployment.
-   Service worker.
-   Offline fallback or offline support for selected screens.
-   Responsive mobile-first design.

### Offline strategy

Offline support should be introduced carefully.

A sensible progression:

1.  Cache the application shell and static assets.
2.  Provide an offline screen or clear connection status.
3.  Consider local draft capture.
4.  Add a reliable sync strategy for drafts and queued changes.
5.  Handle conflicts and failed synchronisation explicitly.

Do not claim that all data is available offline unless it has actually
been stored and synchronised safely.

### Browser limitations

PWA installation, background execution, speech recognition, and push
notifications vary across browsers and operating systems. Test on
current versions of Chrome, Edge, Safari, Android, and iOS.

Speech recognition should have a fallback to manual text entry.

------------------------------------------------------------------------

## 11. Development roadmap

Build in milestones and test each one before moving forward.

### Milestone 1 --- Foundation

-   Create the Next.js project.
-   Configure TypeScript.
-   Configure Tailwind CSS.
-   Install and configure shadcn/ui.
-   Establish typography, spacing, colour tokens, and reusable
    components.
-   Create responsive application layouts.
-   Create the GitHub repository.
-   Configure environment variables.
-   Set up local development and deployment previews.

**Deliverable:** A responsive application shell with navigation and
placeholder screens.

### Milestone 2 --- Brain Dump

-   Build the thought capture interface.
-   Connect Supabase.
-   Save thoughts.
-   List and view thoughts.
-   Edit and delete thoughts.
-   Add categories.
-   Implement search.
-   Add loading, empty, and error states.
-   Add and test RLS policies.

**Deliverable:** Users can securely capture and manage thoughts.

### Milestone 3 --- External Memory

-   Build task creation and editing.
-   Add due dates and priority.
-   Mark tasks complete.
-   Build reminder records.
-   Build daily and upcoming task views.
-   Add validation and useful empty states.

**Deliverable:** Users can manage basic tasks and reminders.

### Milestone 4 --- Voice Capture

-   Add microphone permission handling.
-   Record audio where supported.
-   Integrate speech-to-text if needed.
-   Convert transcription into a saved thought.
-   Let users review and edit the transcript.
-   Handle denied permissions and unsupported browsers.

**Deliverable:** Users can capture spoken thoughts, with text entry as a
fallback.

### Milestone 5 --- Mind Clarity

-   Build daily check-in.
-   Save reflections.
-   Add a simple thought review flow.
-   Build Slow Down Mode.
-   Build One Thing at a Time.
-   Keep the experience optional and non-judgemental.

**Deliverable:** Users can reflect and choose a manageable priority.

### Milestone 6 --- PWA and launch

-   Add the manifest and icons.
-   Configure the service worker.
-   Implement selected offline capabilities.
-   Test installation and browser behaviour.
-   Test mobile and desktop layouts.
-   Review accessibility.
-   Review privacy and security.
-   Deploy a public beta.

**Deliverable:** A publicly accessible PWA.

------------------------------------------------------------------------

## 12. AI-assisted development workflow

Use AI as a coding assistant, not as a replacement for architectural
decisions and code review.

Recommended workflow:

1.  Define one feature and its acceptance criteria.
2.  Ask the coding assistant to inspect the existing project structure.
3.  Request a small implementation.
4.  Review the code and understand the changes.
5.  Run the application and test the feature.
6.  Run linting, type checks, and relevant tests.
7.  Review database migrations and security policies.
8.  Commit the working change to GitHub.
9.  Deploy to a preview or staging environment.
10. Test before merging into the main branch.

### Avoid prompts such as

"Build the entire Mindspace application."

That is too broad and often results in inconsistent architecture,
incomplete features, and difficult debugging.

### Prefer prompts such as

-   "Implement the responsive Brain Dump page using the existing
    shadcn/ui components."
-   "Connect the thought creation form to the existing Supabase client."
-   "Add loading, empty, validation, and error states."
-   "Create and explain the RLS policies for the thoughts table."
-   "Add tests for the thought creation and editing flows."

Keep changes small enough to review.

------------------------------------------------------------------------

## 13. Cost strategy

The initial goal is to spend as little as possible.

  Item             Initial approach
  ---------------- ------------------------------------------------------
  Next.js          Free, open-source
  Tailwind CSS     Free, open-source
  shadcn/ui        Free, open-source
  Supabase         Start with Free tier
  GitHub           Free tier
  Hosting          Suitable free tier for development and early testing
  AI API           Do not integrate initially
  Speech-to-text   Defer until voice capture is implemented
  Custom domain    Optional; purchase when ready
  Design tools     Use existing or free tools

**Initial development target: RM0**, excluding any optional domain, paid
services, or usage beyond free-tier limits.

Before public or commercial launch, review current provider pricing,
free-tier conditions, commercial-use terms, backup options, and expected
usage. Costs can change.

------------------------------------------------------------------------

## 14. Privacy, safety, and reliability

Mindspace may contain personal thoughts, worries, recordings, and
information about users' daily lives. Privacy must be part of the
architecture from the beginning.

Minimum requirements:

-   Private user data by default.
-   Row Level Security on user-owned records.
-   No service-role keys in frontend code.
-   Secure handling of authentication sessions.
-   Clear account deletion and data export procedures.
-   Clear recording and transcription consent.
-   A retention policy for audio files.
-   Avoid collecting data that the application does not need.
-   Do not use private user content for AI processing without clear
    disclosure and an appropriate legal basis.
-   Review the privacy requirements applicable to the intended markets,
    including Malaysia's Personal Data Protection Act where relevant.
-   Provide a way to report problems and contact the product owner.

For launch, also consider backups, database recovery, error monitoring,
email delivery, abuse prevention, and rate limiting.

------------------------------------------------------------------------

## 15. Validation and launch strategy

Do not aim for a large public launch immediately.

### Stage 1 --- Personal use

Use Mindspace yourself for 30 days.

Observe:

-   Which features do you use repeatedly?
-   How quickly can you capture a thought?
-   Do you actually return to saved thoughts?
-   Are reminders useful or distracting?
-   Does the app reduce the need to remember everything?
-   What feels unnecessarily complicated?

### Stage 2 --- Private beta

Invite 5--10 people who experience similar everyday difficulties.

Ask them:

-   What problem were you trying to solve?
-   Was it easy to capture a thought?
-   Did you remember to return to the app?
-   Which feature was most useful?
-   What was confusing or unnecessary?
-   What would make you stop using it?

Do not collect more personal information than necessary.

### Stage 3 --- Public launch

Once the core experience is reliable:

-   Publish the PWA.
-   Create a simple landing page.
-   Explain the product's purpose and limitations.
-   Provide a privacy policy and terms of use.
-   Gather feedback.
-   Prioritise improvements based on actual usage.

------------------------------------------------------------------------

## 16. Product success criteria

Avoid measuring success only through daily active users or streaks.

Early indicators should include:

-   Users can capture a thought in a few seconds.
-   Users can reliably find a saved thought.
-   Users understand what needs attention.
-   Users find reminders useful rather than intrusive.
-   Users feel that the app reduces their mental organisation burden.
-   Users trust the app with personal information.
-   Users voluntarily return because it helps them.

A useful product question is:

**Does Mindspace make it easier for someone to stop carrying every
thought in their head?**

------------------------------------------------------------------------

## 17. Immediate next steps

Recommended order:

1.  Confirm the product name and check domain availability.
2.  Confirm the visual direction.
3.  Decide whether users need accounts from the first release.
4.  Create the Next.js repository.
5.  Configure Tailwind CSS and shadcn/ui.
6.  Create the initial application shell.
7.  Set up Supabase and authentication.
8.  Design the database and RLS policies.
9.  Implement Brain Dump.
10. Use the application personally before expanding its scope.

### Initial project structure

A possible starting structure:

``` text
mindspace/
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── ...
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── home/
│   │   │   ├── thoughts/
│   │   │   ├── tasks/
│   │   │   ├── clarity/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── ...
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── features/
│   │   ├── thoughts/
│   │   ├── tasks/
│   │   ├── reminders/
│   │   └── check-ins/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── validation/
│   └── types/
├── supabase/
│   └── migrations/
├── .env.example
├── package.json
└── README.md
```

This is a starting suggestion, not a requirement to create every folder
immediately.

------------------------------------------------------------------------

## 18. Decisions to confirm

Before implementation, confirm these product decisions:

1.  **Name:** Mindspace, Mindly, Unclutter, or another name.
2.  **Visual direction:** Minimalist and calm; brutalist and monochrome;
    soft and friendly; or dark and technical.
3.  **Accounts:** Require accounts, allow guest mode, or begin with
    local-only use.
4.  **Scope:** Build the core modules progressively, start with Brain
    Dump only, or build the UI before connecting the backend.
5.  **Technology:** Next.js + TypeScript + Tailwind + shadcn/ui with
    Supabase, or Next.js with C# ASP.NET Core and SQL Server.

The recommended default is:

-   **Name:** Mindspace (working name; check trademarks and domain
    availability before committing).
-   **Design:** Minimalist, calm, and modern.
-   **Accounts:** Supabase Auth for a multi-device product, with a
    possible guest mode later.
-   **Scope:** Build all core modules progressively, beginning with
    Brain Dump.
-   **Technology:** Next.js + TypeScript + Tailwind + shadcn/ui +
    Supabase.

------------------------------------------------------------------------

## Closing direction

Build Mindspace for yourself first.

Use it consistently for 30 days. Notice which features genuinely help,
which ones create friction, and what is missing. Then invite a small
group of people to test it.

The most valuable feature may not be AI, complex productivity systems,
or elaborate dashboards. It may simply be a reliable place where someone
can put their thoughts down without worrying about forgetting them.

**Start small. Make it useful. Keep it private. Improve it with real
feedback.**
