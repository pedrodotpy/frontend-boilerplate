import { useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { authTokenCreate } from "@/shared/api/sdk.gen";
import { getAccessToken, setTokens } from "@/shared/auth/tokens";
import { meQueryKey } from "@/shared/auth/useMe";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (getAccessToken()) {
    return <Navigate to={params.get("next") || "/users"} replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { data, error: loginError } = await authTokenCreate({
      body: { email, password } as {
        email: string;
        password: string;
        access: string;
        refresh: string;
      },
      throwOnError: false,
    });

    setPending(false);

    if (loginError || !data?.access || !data?.refresh) {
      setError("Invalid email or password.");
      toast.error("Login failed");
      return;
    }

    setTokens(data.access, data.refresh);
    await queryClient.invalidateQueries({ queryKey: meQueryKey });
    toast.success("Signed in");
    navigate(params.get("next") || "/users", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cbd5e1,_#f8fafc_50%)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            App
          </h1>
          <p className="mt-2 text-slate-600">Sign in to continue</p>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
      </div>
    </div>
  );
}
