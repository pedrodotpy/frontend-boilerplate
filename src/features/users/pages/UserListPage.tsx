import { Link, useSearchParams } from "react-router-dom";

import { useUsersQuery } from "@/features/users/api";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Can } from "@/shared/permissions/Can";

export function UserListPage() {
  const [params, setParams] = useSearchParams();
  const limit = Number(params.get("limit") || 10);
  const offset = Number(params.get("offset") || 0);
  const { data, isLoading, isError } = useUsersQuery({ limit, offset });

  if (isLoading) {
    return <p className="text-slate-600">Loading users…</p>;
  }
  if (isError || !data) {
    return <p className="text-red-600">Failed to load users.</p>;
  }

  const prevOffset = Math.max(offset - limit, 0);
  const nextOffset = offset + limit;
  const hasPrev = offset > 0;
  const hasNext = Boolean(data.next);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Users
          </h1>
          <p className="text-sm text-slate-600">{data.count} total</p>
        </div>
        <Can perm="users.add_user">
          <Link
            to="/users/new"
            className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create user
          </Link>
        </Can>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>{user.is_staff ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Link
                    className="text-sm text-slate-700 underline"
                    to={`/users/${user.id}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {data.results.length} · offset {offset}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() =>
              setParams({ limit: String(limit), offset: String(prevOffset) })
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() =>
              setParams({ limit: String(limit), offset: String(nextOffset) })
            }
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
