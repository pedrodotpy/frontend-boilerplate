import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "@/shared/auth/tokens";
import { useMe } from "@/shared/auth/useMe";

export function RequireAuth() {
  const location = useLocation();
  const token = getAccessToken();
  const me = useMe();

  if (!token) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (me.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (me.isError) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}

export function RequirePerm({ perm }: { perm: string }) {
  const me = useMe();
  const allowed = me.data?.permissions?.includes(perm);

  if (me.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        className="mx-auto max-w-lg px-4 py-16 text-center"
        data-testid="forbidden"
      >
        <h1 className="text-xl font-semibold text-slate-900">Forbidden</h1>
        <p className="mt-2 text-slate-600">
          You need the <code className="rounded bg-slate-100 px-1">{perm}</code>{" "}
          permission.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
