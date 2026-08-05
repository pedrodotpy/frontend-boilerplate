import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  extractFieldErrors,
  type FieldErrors,
  useCreateUser,
} from "@/features/users/api";
import { UserForm } from "@/features/users/components/UserForm";

export function UserCreatePage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [errors, setErrors] = useState<FieldErrors>({});

  return (
    <section className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Create user
      </h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <UserForm
          submitLabel="Create"
          requirePassword
          pending={createUser.isPending}
          errors={errors}
          onSubmit={(values) => {
            setErrors({});
            createUser.mutate(
              {
                email: values.email,
                password: values.password,
                is_active: values.is_active,
                is_staff: values.is_staff,
              },
              {
                onSuccess: (user) => {
                  toast.success("User created");
                  navigate(`/users/${user.id}`);
                },
                onError: (error) => {
                  const fieldErrors = extractFieldErrors(error);
                  setErrors(fieldErrors);
                  toast.error("Could not create user");
                },
              },
            );
          }}
        />
      </div>
    </section>
  );
}
