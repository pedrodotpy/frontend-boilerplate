import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { authResetPasswordCreate } from "@/shared/api/sdk.gen";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultEmail = params.get("email") || "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const code = String(form.get("code") || "");
    const newPassword = String(form.get("new_password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");

    if (newPassword !== confirmPassword) {
      setPending(false);
      setError("Passwords do not match.");
      return;
    }

    const { error: resetError } = await authResetPasswordCreate({
      body: {
        email,
        code,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      throwOnError: false,
    });

    setPending(false);

    if (resetError) {
      setError("Invalid or expired code, or password was rejected.");
      toast.error("Reset failed");
      return;
    }

    toast.success("Password updated");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cbd5e1,_#f8fafc_50%)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Reset password
          </h1>
          <p className="mt-2 text-slate-600">
            Enter the email code and choose a new password.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
          <Link
            to="/forgot-password"
            className="block text-center text-sm text-slate-600 underline-offset-4 hover:underline"
          >
            Request a new code
          </Link>
          <Link
            to="/login"
            className="block text-center text-sm text-slate-600 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
