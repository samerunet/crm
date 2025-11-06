export type UserWithRole = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export async function listUsers(): Promise<UserWithRole[]> {
  const res = await fetch("/api/users", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load users");
  }
  const data = await res.json();
  return (data.users ?? data.items ?? []) as UserWithRole[];
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const res = await fetch(`/api/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to update user role");
  }
}
