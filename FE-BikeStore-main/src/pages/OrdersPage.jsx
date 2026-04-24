import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, DataTable, Input, Modal, PageHeader, Select, StatusBadge } from "../components/ui/Ui";
import { getErrorMessage, orderStatusOptions } from "../utils/helpers";

const defaultForm = {
  customer_id: "",
  order_status: 1,
  order_date: "",
  required_date: "",
  shipped_date: "",
  staff_id: "",
  items: [],
};

export default function OrdersPage() {
  const { isAdmin, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ customer_id: "", staff_id: "", order_status: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm, staff_id: String(user?.staff_id || "") });

  const loadData = async () => {
    try {
      const params = {};
      if (filters.customer_id) params.customer_id = Number(filters.customer_id);
      if (filters.staff_id) params.staff_id = Number(filters.staff_id);
      if (filters.order_status) params.order_status = Number(filters.order_status);
      const { data } = await ordersApi.list(params);
      setRows(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.customer_id, filters.staff_id, filters.order_status]);

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async () => {
    try {
      const payload = {
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        order_status: Number(form.order_status),
        order_date: form.order_date,
        required_date: form.required_date,
        shipped_date: form.shipped_date || null,
        staff_id: Number(form.staff_id),
        items: [],
      };
      await ordersApi.create(payload);
      toast.success("Order created successfully");
      setOpen(false);
      setForm({ ...defaultForm, staff_id: String(user?.staff_id || "") });
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete order #${item.order_id}?`)) return;
    try {
      await ordersApi.remove(item.order_id);
      toast.success("Order deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Manage orders and status" actions={<Button onClick={() => setOpen(true)}>Create Order</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Order Pipeline</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">All</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Pending</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => Number(x.order_status) === 1).length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Processing</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => Number(x.order_status) === 2).length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Completed</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => Number(x.order_status) === 4).length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Flow Note</p>
          <p className="mt-2 text-sm text-on-surface-variant">Keep transitions smooth from pending to completed for clean reporting.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input label="Customer ID" value={filters.customer_id} onChange={(e) => setFilters((prev) => ({ ...prev, customer_id: e.target.value }))} />
          <Input label="Staff ID" value={filters.staff_id} onChange={(e) => setFilters((prev) => ({ ...prev, staff_id: e.target.value }))} />
          <Select
            label="Status"
            value={filters.order_status}
            onChange={(e) => setFilters((prev) => ({ ...prev, order_status: e.target.value }))}
            options={[{ value: "", label: "All" }, ...orderStatusOptions.map((x) => ({ value: String(x.value), label: x.label }))]}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setFilters({ customer_id: "", staff_id: "", order_status: "" })}>Reset</Button>
          </div>
        </div>

        <DataTable
          columns={["ID", "Customer", "Staff", "Status", "Order Date", "Required", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.order_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">ORD-{String(item.order_id).padStart(4, "0")}</td>
              <td className="px-4 py-3">{item.customer_id || "Guest"}</td>
              <td className="px-4 py-3">{item.staff_id}</td>
              <td className="px-4 py-3"><StatusBadge status={item.order_status} /></td>
              <td className="px-4 py-3">{item.order_date}</td>
              <td className="px-4 py-3">{item.required_date}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link to={`/orders/${item.order_id}`} className="rounded-xl bg-surface-container-low px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-on-surface ring-1 ring-outline-variant/40">Detail</Link>
                  {isAdmin ? <Button variant="danger" onClick={() => remove(item)}>Delete</Button> : null}
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal open={open} title="Create Order" onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Customer ID" name="customer_id" value={form.customer_id} onChange={onChange} />
          <Input label="Staff ID" name="staff_id" value={form.staff_id} onChange={onChange} />
          <Select
            label="Order Status"
            name="order_status"
            value={form.order_status}
            onChange={onChange}
            options={orderStatusOptions.map((x) => ({ value: String(x.value), label: x.label }))}
          />
          <Input label="Order Date" type="date" name="order_date" value={form.order_date} onChange={onChange} />
          <Input label="Required Date" type="date" name="required_date" value={form.required_date} onChange={onChange} />
          <Input label="Shipped Date" type="date" name="shipped_date" value={form.shipped_date} onChange={onChange} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
