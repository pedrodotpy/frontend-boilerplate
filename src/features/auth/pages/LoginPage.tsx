import { useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  authResendCodeCreate,
  authTokenCreate,
  authVerifyCodeCreate,
} from "@/shared/api/sdk.gen";
import type { ChallengeRequired, TokenPair } from "@/shared/api/types.gen";
import { getAccessToken, setTokens } from "@/shared/auth/tokens";
import { meQueryKey } from "@/shared/auth/useMe";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

function isTokenPair(data: unknown): data is TokenPair {
  return (
    typeof data === "object" &&
    data !== null &&
    "access" in data &&
    "refresh" in data &&
    typeof (data as TokenPair).access === "string" &&
    typeof (data as TokenPair).refresh === "string"
  );
}

function isChallenge(data: unknown): data is ChallengeRequired {
  return (
    typeof data === "object" &&
    data !== null &&
    "challenge_id" in data &&
    "destination" in data
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeRequired | null>(null);

  if (getAccessToken()) {
    return <Navigate to={params.get("next") || "/users"} replace />;
  }

  async function finishLogin(tokens: TokenPair) {
    setTokens(tokens.access, tokens.refresh);
    await queryClient.invalidateQueries({ queryKey: meQueryKey });
    toast.success("Signed in");
    navigate(params.get("next") || "/users", { replace: true });
  }

  async function onSubmitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { data, error: loginError } = await authTokenCreate({
      body: { email, password },
      throwOnError: false,
    });

    setPending(false);

    if (loginError) {
      setError("Invalid email or password.");
      toast.error("Login failed");
      return;
    }

    if (isChallenge(data)) {
      setChallenge(data);
      toast.message("Enter the code sent to your email");
      return;
    }

    if (!isTokenPair(data)) {
      setError("Invalid email or password.");
      toast.error("Login failed");
      return;
    }

    await finishLogin(data);
  }

  async function onSubmitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") || "");

    const { data, error: verifyError } = await authVerifyCodeCreate({
      body: { challenge_id: challenge.challenge_id, code },
      throwOnError: false,
    });

    setPending(false);

    if (verifyError || !isTokenPair(data)) {
      setError("Invalid or expired code.");
      toast.error("Verification failed");
      return;
    }

    await finishLogin(data);
  }

  async function onResend() {
    if (!challenge) return;
    setPending(true);
    setError(null);
    const { data, error: resendError } = await authResendCodeCreate({
      body: { challenge_id: challenge.challenge_id },
      throwOnError: false,
    });
    setPending(false);
    if (resendError || !isChallenge(data)) {
      setError("Could not resend code.");
      toast.error("Resend failed");
      return;
    }
    setChallenge(data);
    toast.success("Code resent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cbd5e1,_#f8fafc_50%)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            App
          </h1>
          <p className="mt-2 text-slate-600">
            {challenge
              ? `Enter the code sent to ${challenge.destination}`
              : "Sign in to continue"}
          </p>
        </div>

        {challenge ? (
          <form
            onSubmit={onSubmitCode}
            className="space-y-4 rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur"
          >
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
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Verifying…" : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={onResend}
            >
              Resend code
            </Button>
            <button
              type="button"
              className="w-full text-sm text-slate-600 underline-offset-4 hover:underline"
              onClick={() => {
                setChallenge(null);
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form
            onSubmit={onSubmitPassword}
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
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-slate-600 underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
