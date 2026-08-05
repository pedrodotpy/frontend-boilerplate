import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UserCreatePage } from "@/features/users/pages/UserCreatePage";
import { UserDetailPage } from "@/features/users/pages/UserDetailPage";
import { UserEditPage } from "@/features/users/pages/UserEditPage";
import { UserListPage } from "@/features/users/pages/UserListPage";
import { AppShell } from "@/shared/layout/AppShell";
import { RequireAuth, RequirePerm } from "@/shared/permissions/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/users" replace /> },
          {
            path: "users",
            element: <RequirePerm perm="users.view_user" />,
            children: [
              { index: true, element: <UserListPage /> },
              {
                path: "new",
                element: <RequirePerm perm="users.add_user" />,
                children: [{ index: true, element: <UserCreatePage /> }],
              },
              { path: ":id", element: <UserDetailPage /> },
              {
                path: ":id/edit",
                element: <RequirePerm perm="users.change_user" />,
                children: [{ index: true, element: <UserEditPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/users" replace /> },
]);
