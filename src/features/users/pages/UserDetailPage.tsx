import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useDeleteUser, useUserQuery } from "@/features/users/api";
import { Button } from "@/shared/components/ui/button";
import { Can } from "@/shared/permissions/Can";

export function UserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useUserQuery(userId);
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return <p className="text-slate-600">Loading user…</p>;
  }
  if (isError || !data) {
    return <p className="text-red-600">User not found.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {data.email}
          </h1>
          <p className="text-sm text-slate-600">User #{data.id}</p>
        </div>
        <div className="flex gap-2">
          <Can perm="users.change_user">
            <Link
              to={`/users/${data.id}/edit`}
              className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm hover:bg-slate-50"
            >
              Edit
            </Link>
          </Can>
          <Can perm="users.delete_user">
            <Button
              variant="destructive"
              onClick={() => {
                if (!window.confirm(`Delete ${data.email}?`)) {
                  return;
                }
                deleteUser.mutate(data.id, {
                  onSuccess: () => {
                    toast.success("User deleted");
                    navigate("/users");
                  },
                  onError: () => toast.error("Failed to delete user"),
                });
              }}
              disabled={deleteUser.isPending}
            >
              Delete
            </Button>
          </Can>
        </div>
      </div>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Active
          </dt>
          <dd className="text-slate-900">{data.is_active ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Staff
          </dt>
          <dd className="text-slate-900">{data.is_staff ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Superuser
          </dt>
          <dd className="text-slate-900">{data.is_superuser ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Created
          </dt>
          <dd className="text-slate-900">{data.created}</dd>
        </div>
      </dl>

      <Link to="/users" className="text-sm text-slate-700 underline">
        Back to users
      </Link>
    </section>
  );
}
