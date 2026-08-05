import type { FormEvent } from "react";
import type { FieldErrors } from "@/features/users/api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export interface UserFormValues {
  email: string;
  password: string;
  is_active: boolean;
  is_staff: boolean;
}

interface UserFormProps {
  initial?: Partial<UserFormValues>;
  submitLabel: string;
  pending?: boolean;
  errors?: FieldErrors;
  requirePassword?: boolean;
  onSubmit: (values: UserFormValues) => void;
}

export function UserForm({
  initial,
  submitLabel,
  pending,
  errors,
  requirePassword = false,
  onSubmit,
}: UserFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      is_active: form.get("is_active") === "on",
      is_staff: form.get("is_staff") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initial?.email ?? ""}
          autoComplete="email"
        />
        {errors?.email?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password{requirePassword ? "" : " (leave blank to keep)"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={requirePassword}
          minLength={requirePassword ? 8 : undefined}
          autoComplete="new-password"
        />
        {errors?.password?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={initial?.is_active ?? true}
          className="size-4 rounded border-slate-300"
        />
        Active
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="is_staff"
          defaultChecked={initial?.is_staff ?? false}
          className="size-4 rounded border-slate-300"
        />
        Staff
      </label>

      {errors?.non_field_errors?.map((msg) => (
        <p key={msg} className="text-sm text-red-600">
          {msg}
        </p>
      ))}
      {errors?.detail?.map((msg) => (
        <p key={msg} className="text-sm text-red-600">
          {msg}
        </p>
      ))}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
