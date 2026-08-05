import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  extractFieldErrors,
  type FieldErrors,
  useUpdateUser,
  useUserQuery,
} from "@/features/users/api";
import { UserForm } from "@/features/users/components/UserForm";

export function UserEditPage() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useUserQuery(userId);
  const updateUser = useUpdateUser(userId);
  const [errors, setErrors] = useState<FieldErrors>({});

  if (isLoading) {
    return <p className="text-slate-600">Loading user…</p>;
  }
  if (isError || !data) {
    return <p className="text-red-600">User not found.</p>;
  }

  return (
    <section className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Edit user
      </h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <UserForm
          initial={{
            email: data.email,
            is_active: data.is_active,
            is_staff: data.is_staff,
            password: "",
          }}
          submitLabel="Save"
          pending={updateUser.isPending}
          errors={errors}
          onSubmit={(values) => {
            setErrors({});
            updateUser.mutate(
              {
                email: values.email,
                is_active: values.is_active,
                is_staff: values.is_staff,
                ...(values.password ? { password: values.password } : {}),
              },
              {
                onSuccess: () => {
                  toast.success("User updated");
                  navigate(`/users/${userId}`);
                },
                onError: (error) => {
                  setErrors(extractFieldErrors(error));
                  toast.error("Could not update user");
                },
              },
            );
          }}
        />
      </div>
    </section>
  );
}
