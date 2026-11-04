import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { FormMessages } from "@/components/forms/form-parts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Used while email sign-in is hidden (D-020, src/lib/features.ts).
export function GoogleOnlySignIn({ error }: { error?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Sign in to Mindspace</h1>
        </CardTitle>
        <CardDescription>
          New here? Signing in with Google creates your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormMessages error={error} />
        <GoogleSignIn />
        <Alert>
          <AlertTitle>Why only Google for now?</AlertTitle>
          <AlertDescription>
            Mindspace is in its early days. Signing in with an email and
            password means sending you emails, like a code to confirm your
            address, and that isn’t set up yet. We’ll add it later. Until then,
            Google is the way in.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
