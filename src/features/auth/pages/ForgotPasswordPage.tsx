import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authForgotPasswordCreate } from "@/shared/api/sdk.gen";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    const { error } = await authForgotPasswordCreate({
      body: { email },
      throwOnError: false,
    });

    setPending(false);

    if (error) {
      toast.error("Could not start password reset");
      return;
    }

    setSubmittedEmail(email);
    toast.success("If that account exists, a code was sent");
  }

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cbd5e1,_#f8fafc_50%)] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Check your email
          </h1>
          <p className="text-slate-600">
            If an account exists for {submittedEmail}, we sent a 6-digit code.
            It expires in 10 minutes.
          </p>
          <Button
            className="w-full"
            onClick={() =>
              navigate(
                `/reset-password?email=${encodeURIComponent(submittedEmail)}`,
              )
            }
          >
            Enter reset code
          </Button>
          <Link
            to="/login"
            className="block text-sm text-slate-600 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cbd5e1,_#f8fafc_50%)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Forgot password
          </h1>
          <p className="mt-2 text-slate-600">
            Enter your email and we will send a reset code.
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
              autoComplete="username"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset code"}
          </Button>
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
