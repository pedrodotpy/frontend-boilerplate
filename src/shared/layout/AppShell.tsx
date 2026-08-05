import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authLogoutCreate } from "@/shared/api/sdk.gen";
import { clearTokens, getRefreshToken } from "@/shared/auth/tokens";
import { meQueryKey, useMe } from "@/shared/auth/useMe";
import { Button } from "@/shared/components/ui/button";

export function AppShell() {
  const me = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        await authLogoutCreate({ body: { refresh }, throwOnError: false });
      }
    },
    onSettled: async () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: meQueryKey });
      queryClient.clear();
      toast.success("Signed out");
      navigate("/login", { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_45%)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              to="/users"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              App
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/users" className="text-slate-700 hover:text-slate-900">
                Users
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{me.data?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
