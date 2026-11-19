"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
};

export default function AdminTeamPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/admins")
      .then(async res => (res.ok ? res.json() : { users: [], currentAdminId: "" }))
      .then(data => {
        if (!active) return;
        setUsers(data.users || []);
        setCurrentAdminId(data.currentAdminId || "");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to create administrator.");
        return;
      }
      setUsers(current => [data, ...current]);
      setName("");
      setEmail("");
      setPassword("");
      setMessage(`${data.name} (${data.email}) added as an administrator. They can sign in at /login.`);
    } finally {
      setBusy(false);
    }
  };

  const setRole = async (user: UserItem, role: "admin" | "customer") => {
    setUpdatingId(user.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/admins/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to update user role.");
        return;
      }
      setUsers(current => current.map(item => (item.id === user.id ? data : item)));
      setMessage(
        role === "admin"
          ? `${user.name} now has administrator access.`
          : `Removed administrator access from ${user.name}.`,
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const admins = useMemo(() => users.filter(u => u.role === "admin"), [users]);
  const customers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      u => u.role === "customer" && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)),
    );
  }, [search, users]);

  return (
    <div className="grid gap-10 lg:grid-cols-[390px_1fr]">
      {/* Create new admin */}
      <section className="h-fit border border-line bg-white p-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Team Access</p>
        <h1 className="mt-2 text-3xl font-semibold">Add administrator</h1>
        <p className="mt-2 text-xs leading-5 text-stone-600">
          Create a new admin account directly, or promote an existing registered user from the list on the right.
        </p>

        <form onSubmit={createAdmin} className="mt-6 grid gap-3 text-xs">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Full name"
            className="border border-line p-3 outline-wine"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type="email"
            placeholder="Email address"
            className="border border-line p-3 outline-wine"
          />
          <div className="flex border border-line focus-within:border-wine">
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              type={showPassword ? "text" : "password"}
              placeholder="Temporary password (8+ chars)"
              className="min-w-0 w-full flex-1 p-3 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              className="shrink-0 px-3 text-[11px] font-medium text-stone-500 hover:text-wine"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            disabled={busy}
            className="mt-2 bg-wine py-4 font-medium text-white transition hover:bg-[#6d2038] disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add administrator"}
          </button>
          {message && <p className="text-xs font-medium text-[#1f6236]">{message}</p>}
          {error && <p className="text-xs font-medium text-red-700">{error}</p>}
        </form>
      </section>

      {/* Lists */}
      <div className="space-y-8">
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Privileged Access</p>
              <h2 className="mt-2 text-3xl font-semibold">Administrators ({admins.length})</h2>
            </div>
          </div>

          <div className="mt-5 border border-line bg-white">
            {loading ? (
              <p className="p-6 text-xs text-stone-500">Loading team…</p>
            ) : (
              <div className="divide-y divide-line text-xs">
                {admins.map(admin => {
                  const isSelf = admin.id === currentAdminId;
                  return (
                    <div key={admin.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-semibold text-ink">{admin.name}</strong>
                          <span className="rounded-full bg-blush px-2.5 py-0.5 text-[10px] font-medium text-wine">
                            {isSelf ? "Admin · You" : "Admin"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-stone-500">{admin.email}</p>
                      </div>
                      {!isSelf && (
                        <button
                          disabled={updatingId === admin.id}
                          onClick={() => setRole(admin, "customer")}
                          className="border border-line px-3 py-1.5 text-[11px] font-medium text-stone-600 transition hover:border-wine hover:text-wine disabled:opacity-50"
                        >
                          {updatingId === admin.id ? "Updating…" : "Revoke admin"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Promote Existing User</p>
              <h2 className="mt-2 text-2xl font-semibold">Registered accounts</h2>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="border border-line bg-white px-3 py-2 text-xs outline-wine sm:w-60"
            />
          </div>

          <div className="mt-5 border border-line bg-white">
            {customers.length ? (
              <div className="divide-y divide-line text-xs">
                {customers.map(customer => (
                  <div key={customer.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium text-ink">{customer.name}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">{customer.email}</p>
                    </div>
                    <button
                      disabled={updatingId === customer.id}
                      onClick={() => setRole(customer, "admin")}
                      className="border border-wine px-3.5 py-1.5 text-[11px] font-medium text-wine transition hover:bg-wine hover:text-white disabled:opacity-50"
                    >
                      {updatingId === customer.id ? "Updating…" : "Make admin"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-xs text-stone-500">No matching customer accounts found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
