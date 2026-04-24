import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { customersApi } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, DataTable, Input, Modal, PageHeader } from "../components/ui/Ui";
import { getErrorMessage } from "../utils/helpers";

const defaultForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zip_code: "",
};

export default function CustomersPage() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ city: "", state: "" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      const { data } = await customersApi.list(params);
      setRows(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.city, filters.state]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...defaultForm, ...item });
    setOpen(true);
  };

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async () => {
    try {
      const payload = { ...form };
      if (editing) {
        await customersApi.update(editing.customer_id, payload);
        toast.success("Customer updated successfully");
      } else {
        await customersApi.create(payload);
        toast.success("Customer created successfully");
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete customer ${item.first_name} ${item.last_name}?`)) return;
    try {
      await customersApi.remove(item.customer_id);
      toast.success("Customer deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Manage customers" actions={<Button onClick={openCreate}>Add Customer</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Customer Base</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Total Customers</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Cities</p>
              <p className="mt-1 text-2xl font-black text-primary">{new Set(rows.map((x) => x.city).filter(Boolean)).size}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">States</p>
              <p className="mt-1 text-2xl font-black text-primary">{new Set(rows.map((x) => x.state).filter(Boolean)).size}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Retention Note</p>
          <p className="mt-2 text-sm text-on-surface-variant">Keep customer profiles complete to accelerate order creation.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input label="City" value={filters.city} onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))} />
          <Input label="State" value={filters.state} onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))} />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setFilters({ city: "", state: "" })}>Reset Filters</Button>
          </div>
        </div>

        <DataTable
          columns={["ID", "Name", "Email", "Phone", "City", "State", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.customer_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">CUS-{String(item.customer_id).padStart(3, "0")}</td>
              <td className="px-4 py-3 font-semibold text-primary">{item.first_name} {item.last_name}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">{item.phone || "-"}</td>
              <td className="px-4 py-3">{item.city || "-"}</td>
              <td className="px-4 py-3">{item.state || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                  {isAdmin ? <Button variant="danger" onClick={() => remove(item)}>Delete</Button> : null}
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal open={open} title={editing ? "Edit Customer" : "Add Customer"} onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First Name" name="first_name" value={form.first_name} onChange={onChange} />
          <Input label="Last Name" name="last_name" value={form.last_name} onChange={onChange} />
          <Input label="Email" name="email" value={form.email} onChange={onChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
          <Input label="Street" name="street" value={form.street} onChange={onChange} />
          <Input label="City" name="city" value={form.city} onChange={onChange} />
          <Input label="State" name="state" value={form.state} onChange={onChange} />
          <Input label="Zip Code" name="zip_code" value={form.zip_code} onChange={onChange} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
