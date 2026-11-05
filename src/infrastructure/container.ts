import "server-only";
import { redirect } from "next/navigation";
import type { AuthService } from "@/application/auth/auth-service";
import {
  makeCreateUserKeys,
  makeGetUserKeys,
  makeReplaceUserKeys,
} from "@/application/encryption/user-keys";
import { makeGetProfile } from "@/application/profiles/get-profile";
import { makeSaveDetectedTimezone } from "@/application/profiles/save-detected-timezone";
import { makeUpdateTimezone } from "@/application/profiles/update-timezone";
import {
  makeCompleteTask,
  makeCreateTaskRecord,
  makeDeleteTaskRecord,
  makeGetTaskRecord,
  makeGetToday,
  makeListTaskRecords,
  makeReopenTask,
  makeUpdateTaskRecord,
} from "@/application/tasks/records";
import {
  makeAddReminder,
  makeDismissReminder,
  makeListActiveReminders,
} from "@/application/tasks/reminders";
import {
  makeCreateCategoryRecord,
  makeCreateThoughtRecord,
  makeDeleteCategoryRecord,
  makeDeleteThoughtRecord,
  makeGetInboxPreview,
  makeGetThoughtRecord,
  makeListCategoryRecords,
  makeListThoughtRecords,
  makeRenameCategoryRecord,
  makeUpdateThoughtRecord,
} from "@/application/thoughts/records";
import { createSupabaseAuthService } from "@/infrastructure/auth/supabase-auth-service";
import { createSupabaseCategoryRepository } from "@/infrastructure/repositories/supabase-category-repository";
import { createSupabaseProfileRepository } from "@/infrastructure/repositories/supabase-profile-repository";
import { createSupabaseReminderRepository } from "@/infrastructure/repositories/supabase-reminder-repository";
import { createSupabaseTaskRepository } from "@/infrastructure/repositories/supabase-task-repository";
import { createSupabaseThoughtRepository } from "@/infrastructure/repositories/supabase-thought-repository";
import { createSupabaseUserKeysRepository } from "@/infrastructure/repositories/supabase-user-keys-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function getAuthService(): Promise<AuthService> {
  return createSupabaseAuthService(await createSupabaseServerClient());
}

// The security check for every data read and Server Action; the proxy is only a convenience.
export async function getAppContext() {
  const supabase = await createSupabaseServerClient();
  // getClaims verifies the token's signature, so the user id can be trusted.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/sign-in");

  const profiles = createSupabaseProfileRepository(supabase);
  const userKeys = createSupabaseUserKeysRepository(supabase);
  const thoughts = createSupabaseThoughtRepository(supabase);
  const categories = createSupabaseCategoryRepository(supabase);
  const tasks = createSupabaseTaskRepository(supabase);
  const reminders = createSupabaseReminderRepository(supabase);
  const clock = () => new Date();
  return {
    user: { id: data.claims.sub, email: data.claims.email ?? null },
    useCases: {
      getProfile: makeGetProfile({ profiles }),
      updateTimezone: makeUpdateTimezone({ profiles }),
      saveDetectedTimezone: makeSaveDetectedTimezone({ profiles }),
      getUserKeys: makeGetUserKeys({ userKeys }),
      createUserKeys: makeCreateUserKeys({ userKeys }),
      replaceUserKeys: makeReplaceUserKeys({ userKeys }),
      listThoughtRecords: makeListThoughtRecords({ thoughts }),
      getInboxPreview: makeGetInboxPreview({ thoughts }),
      getThoughtRecord: makeGetThoughtRecord({ thoughts }),
      createThoughtRecord: makeCreateThoughtRecord({ thoughts }),
      updateThoughtRecord: makeUpdateThoughtRecord({ thoughts }),
      deleteThoughtRecord: makeDeleteThoughtRecord({ thoughts }),
      listCategoryRecords: makeListCategoryRecords({ categories }),
      createCategoryRecord: makeCreateCategoryRecord({ categories }),
      renameCategoryRecord: makeRenameCategoryRecord({ categories }),
      deleteCategoryRecord: makeDeleteCategoryRecord({ categories }),
      getToday: makeGetToday({ profiles, clock }),
      listTaskRecords: makeListTaskRecords({ tasks, profiles, clock }),
      getTaskRecord: makeGetTaskRecord({ tasks }),
      createTaskRecord: makeCreateTaskRecord({ tasks }),
      updateTaskRecord: makeUpdateTaskRecord({ tasks }),
      deleteTaskRecord: makeDeleteTaskRecord({ tasks }),
      completeTask: makeCompleteTask({ tasks, clock }),
      reopenTask: makeReopenTask({ tasks }),
      addReminder: makeAddReminder({ reminders }),
      listActiveReminders: makeListActiveReminders({ reminders }),
      dismissReminder: makeDismissReminder({ reminders, clock }),
    },
  };
}
