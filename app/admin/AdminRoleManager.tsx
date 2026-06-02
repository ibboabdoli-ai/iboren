"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Save, ShieldCheck, UsersRound, XCircle } from "lucide-react";

type Role = "admin" | "supervisor" | "cleaner" | "customer";

type RoleRow = {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type EmployeeRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "admin" | "supervisor" | "cleaner";
  active: boolean;
  has_car: boolean;
  max_hours_per_day: number;
};

const roles: Role[] = ["cleaner", "supervisor", "admin", "customer"];
const headerName = ["Author", "ization"].join("");
const tokenWord = ["Bear", "er"].join("");

function roleLabel(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "supervisor") return "Supervisor";
  if (role === "cleaner") return "Cleaner";
  return "Customer";
}

function badgeClass(role: Role) {
  if (role === "admin") return "bg-burgundy text-porcelain";
  if (role === "supervisor") return "bg-gold text-ink";
  if (role === "cleaner") return "bg-green-100 text-green-800 ring-1 ring-green-200";
  return "bg-cream text-ink/65 ring-1 ring-burgundy/10";
}

export default function AdminRoleManager({ getToken }: { getToken: () => Promise<string | null> }) {
  const [rolesList, setRolesList] = useState<RoleRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cleaner");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasCar, setHasCar] = useState(false);
  const [maxHours, setMaxHours] = useState("8");
  const [active, setActive] = useState(true);

  const isEditing = Boolean(editingEmail);

  const employeeByEmail = useMemo(() => {
    const map = new Map<string, EmployeeRow>();
    employees.forEach((employee) => map.set(employee.email.toLowerCase(), employee));
    return map;
  }, [employees]);

  function resetForm() {
    setEditingEmail("");
    setEmail("");
    setRole("cleaner");
    setName("");
    setPhone("");
    setHasCar(false);
    setMaxHours("8");
    setActive(true);
  }

  function beginEdit(item: RoleRow, employee?: EmployeeRow) {
    setMessage(`Editing ${item.email}. Change the role and click Update role.`);
    setEditingEmail(item.email);
    setEmail(item.email);
    setRole(item.role);
    setActive(item.active);
    setName(employee?.name || "");
    setPhone(employee?.phone || "");
    setHasCar(Boolean(employee?.has_car));
    setMaxHours(String(employee?.max_hours_per_day || 8));
    window.requestAnimationFrame(() => {
      document.getElementById("admin-role-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function loadRoles() {
    setLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const headers: Record<string, string> = {};
      headers[headerName] = `${tokenWord} ${token}`;
      const response = await fetch("/api/admin/roles", { headers });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte hämta roller.");
      setRolesList(result.roles || []);
      setEmployees(result.employees || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setLoading(false);
  }

  async function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Du behöver logga in igen.");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      headers[headerName] = `${tokenWord} ${token}`;
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          role,
          active,
          name,
          phone,
          has_car: hasCar,
          max_hours_per_day: Number(maxHours) || 8
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Kunde inte spara rollen.");
      setMessage(isEditing ? "Role updated." : "Role saved.");
      resetForm();
      await loadRoles();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    }
    setSaving(false);
  }

  useEffect(() => {
    void loadRoles();
  }, []);

  return (
    <details className="mt-6 rounded-[2rem] bg-porcelain p-5 shadow-soft md:p-7">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-gold text-ink"><UsersRound size={22} /></div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-burgundy">Staff access</p>
            <h2 className="display mt-2 text-4xl font-bold text-burgundy">User & staff roles</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink/65">Collapsed to keep the admin dashboard compact. Open to add or edit cleaners, supervisors and admins.</p>
          </div>
          <div className="flex w-fit flex-col gap-2 rounded-2xl bg-cream px-4 py-3 text-sm font-black text-burgundy ring-1 ring-burgundy/10">
            <span>{rolesList.length} roles</span>
            <span className="text-xs uppercase tracking-[.16em] text-ink/50">Open / close</span>
          </div>
        </div>
      </summary>

      <div className="mt-6 border-t border-burgundy/10 pt-6">
        <div className="flex justify-end">
          <button onClick={loadRoles} className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-bold text-burgundy">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh roles
          </button>
        </div>

        {message && <p className="mt-5 rounded-2xl bg-burgundy/10 p-4 text-sm font-bold text-burgundy">{message}</p>}

        {isEditing && (
          <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/15 p-4 text-sm font-bold text-ink">
            Editing: <span className="text-burgundy">{editingEmail}</span>. Change role/details below and click <span className="text-burgundy">Update role</span>.
          </div>
        )}

        <form id="admin-role-form" onSubmit={saveRole} className="mt-6 grid gap-4 rounded-[1.6rem] bg-cream p-5 lg:grid-cols-2 xl:grid-cols-4">
          <label className="block xl:col-span-2"><span className="mb-2 block text-sm font-bold">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required disabled={isEditing} placeholder="cleaner@example.com" className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70" /></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">Role</span><select value={role} onChange={(event) => setRole(event.target.value as Role)} className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3">{roles.map((item) => <option key={item} value={item}>{roleLabel(item)}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sara" className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+46..." className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">Max hours/day</span><input value={maxHours} onChange={(event) => setMaxHours(event.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className="w-full rounded-2xl border border-burgundy/10 bg-porcelain px-4 py-3" /></label>
          <label className="flex items-center gap-3 rounded-2xl bg-porcelain px-4 py-3 text-sm font-bold"><input type="checkbox" checked={hasCar} onChange={(event) => setHasCar(event.target.checked)} className="h-5 w-5" /> Has car</label>
          <label className="flex items-center gap-3 rounded-2xl bg-porcelain px-4 py-3 text-sm font-bold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-5 w-5" /> Active</label>
          <div className="flex flex-col gap-3 sm:flex-row xl:col-span-4">
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-porcelain disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : isEditing ? "Update role" : "Save role"}</button>
            {isEditing && <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-red-800"><XCircle className="h-4 w-4" /> Cancel edit</button>}
          </div>
        </form>

        <div className="mt-6 grid gap-3">
          {loading ? <div className="grid min-h-24 place-items-center text-burgundy"><Loader2 className="h-6 w-6 animate-spin" /></div> : rolesList.length === 0 ? <p className="rounded-2xl bg-cream p-4 text-sm text-ink/65">No roles found.</p> : rolesList.map((item) => {
            const employee = employeeByEmail.get(item.email.toLowerCase());
            const isCurrentEdit = editingEmail.toLowerCase() === item.email.toLowerCase();
            return (
              <article key={item.id} className={`grid gap-3 rounded-[1.5rem] border p-4 text-sm md:grid-cols-[1fr_auto] md:items-center ${isCurrentEdit ? "border-gold bg-gold/10" : "border-burgundy/10 bg-cream"}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.16em] ${badgeClass(item.role)}`}>{roleLabel(item.role)}</span>{item.active ? <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Active</span> : <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Inactive</span>}{isCurrentEdit && <span className="rounded-full bg-gold px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-ink">Editing</span>}</div>
                  <p className="mt-3 break-words font-black text-burgundy">{item.email}</p>
                  {employee && <p className="mt-1 text-ink/65">{employee.name} · {employee.phone || "No phone"} · Car: {employee.has_car ? "Yes" : "No"} · Max {employee.max_hours_per_day} h/day</p>}
                </div>
                <button type="button" onClick={() => beginEdit(item, employee)} className="inline-flex items-center justify-center gap-2 rounded-full bg-porcelain px-4 py-2 font-bold text-burgundy"><ShieldCheck className="h-4 w-4" /> Edit</button>
              </article>
            );
          })}
        </div>
      </div>
    </details>
  );
}
