import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { staffsApi } from "../api/services";
import { Button, Card, DataTable, Input, Modal, PageHeader, Select } from "../components/ui/Ui";
import { getErrorMessage } from "../utils/helpers";

const defaultForm = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
};

export default function StaffsPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    try {
      const { data } = await staffsApi.list();
      setRows(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...defaultForm, ...item, password: "" });
    setOpen(true);
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async () => {
    try {
      if (editing) {
        const payload = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          active: form.active,
          is_active: form.is_active,
        };
        await staffsApi.update(editing.staff_id, payload);
        toast.success("Staff updated successfully");
      } else {
        await staffsApi.create({
          username: form.username,
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        });
        toast.success("Staff created successfully");
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete staff ${item.first_name} ${item.last_name}?`)) return;
    try {
      await staffsApi.remove(item.staff_id);
      toast.success("Staff deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleField = async (item, key) => {
    try {
      await staffsApi.update(item.staff_id, { [key]: !item[key] });
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Management" subtitle="Manage staff under your authority" actions={<Button onClick={openCreate}>Add Staff</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Workforce Overview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Total Staff</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Active</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => x.active).length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Login Enabled</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => x.is_active).length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Quick Roles</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">All Roles</span>
            <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">Admins</span>
            <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">Staffs</span>
          </div>
        </Card>
      </div>

      <Card>
        <DataTable
          columns={["ID", "Name", "Username", "Email", "Role", "Active", "Login", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.staff_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">STA-{String(item.staff_id).padStart(3, "0")}</td>
              <td className="px-4 py-3 font-semibold text-primary">{item.first_name} {item.last_name}</td>
              <td className="px-4 py-3">{item.username}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{item.role}</span>
              </td>
              <td className="px-4 py-3">
                <button className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary" onClick={() => toggleField(item, "active")}>{item.active ? "Active" : "Inactive"}</button>
              </td>
              <td className="px-4 py-3">
                <button className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary" onClick={() => toggleField(item, "is_active")}>{item.is_active ? "Enabled" : "Disabled"}</button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal open={open} title={editing ? "Edit Staff" : "Add Staff"} onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          {!editing ? <Input label="Username" name="username" value={form.username} onChange={onChange} /> : null}
          <Input label="Email" name="email" value={form.email} onChange={onChange} />
          {!editing ? <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} /> : null}
          <Input label="First Name" name="first_name" value={form.first_name} onChange={onChange} />
          <Input label="Last Name" name="last_name" value={form.last_name} onChange={onChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
          {editing ? (
            <Select
              label="Role"
              name="role"
              value={form.role || "STAFF"}
              onChange={onChange}
              options={[{ value: "STAFF", label: "Staff" }, { value: "ADMIN", label: "Admin" }]}
            />
          ) : null}
        </div>
        {editing ? (
          <div className="mt-4 flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" checked={!!form.active} onChange={onChange} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" checked={!!form.is_active} onChange={onChange} /> Login Enabled</label>
          </div>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
