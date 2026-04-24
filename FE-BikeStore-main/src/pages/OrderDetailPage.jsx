import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { ordersApi } from "../api/services";
import { Button, Card, DataTable, Input, Modal, PageHeader, Select, StatusBadge } from "../components/ui/Ui";
import { formatCurrency, getErrorMessage, orderStatusOptions } from "../utils/helpers";

const itemDefault = { product_id: "", quantity: "1", list_price: "", discount: "0" };

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState(null);
  const [itemModal, setItemModal] = useState(false);
  const [itemEditing, setItemEditing] = useState(null);
  const [itemForm, setItemForm] = useState(itemDefault);

  const loadData = async () => {
    try {
      const { data } = await ordersApi.detail(orderId);
      setOrder(data);
      setForm({
        customer_id: data.customer_id || "",
        staff_id: data.staff_id,
        order_status: data.order_status,
        order_date: data.order_date,
        required_date: data.required_date,
        shipped_date: data.shipped_date || "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadData();
  }, [orderId]);

  const total = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const line = Number(item.quantity) * Number(item.list_price) * (1 - Number(item.discount || 0));
      return sum + line;
    }, 0);
  }, [order]);

  const onOrderChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const onItemChange = (event) => setItemForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const saveOrder = async () => {
    try {
      await ordersApi.update(orderId, {
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        staff_id: Number(form.staff_id),
        order_status: Number(form.order_status),
        order_date: form.order_date,
        required_date: form.required_date,
        shipped_date: form.shipped_date || null,
      });
      toast.success("Order updated successfully");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openAddItem = () => {
    setItemEditing(null);
    setItemForm(itemDefault);
    setItemModal(true);
  };

  const openEditItem = (item) => {
    setItemEditing(item);
    setItemForm({
      product_id: String(item.product_id),
      quantity: String(item.quantity),
      list_price: String(item.list_price),
      discount: String(item.discount),
    });
    setItemModal(true);
  };

  const saveItem = async () => {
    try {
      const payload = {
        product_id: Number(itemForm.product_id),
        quantity: Number(itemForm.quantity),
        list_price: Number(itemForm.list_price),
        discount: Number(itemForm.discount || 0),
      };

      if (itemEditing) {
        await ordersApi.updateItem(orderId, itemEditing.item_id, payload);
        toast.success("Item updated successfully");
      } else {
        await ordersApi.addItem(orderId, payload);
        toast.success("Item added successfully");
      }
      setItemModal(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete item #${item.item_id}?`)) return;
    try {
      await ordersApi.removeItem(orderId, item.item_id);
      toast.success("Item deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!order || !form) {
    return <p className="text-on-surface-variant">Loading order...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Order #${order.order_id}`} subtitle="Order details and item list" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Order Metrics</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Items</p>
              <p className="mt-1 text-2xl font-black text-primary">{(order.items || []).length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Total</p>
              <p className="mt-1 text-xl font-black text-primary">{formatCurrency(total)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Status</p>
              <div className="mt-2"><StatusBadge status={Number(form.order_status)} /></div>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Order Code</p>
          <p className="mt-2 font-mono text-sm text-primary">ORD-{String(order.order_id).padStart(4, "0")}</p>
        </Card>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Customer ID" name="customer_id" value={form.customer_id} onChange={onOrderChange} />
          <Input label="Staff ID" name="staff_id" value={form.staff_id} onChange={onOrderChange} />
          <Select
            label="Order Status"
            name="order_status"
            value={form.order_status}
            onChange={onOrderChange}
            options={orderStatusOptions.map((x) => ({ value: String(x.value), label: x.label }))}
          />
          <Input label="Order Date" name="order_date" type="date" value={form.order_date} onChange={onOrderChange} />
          <Input label="Required Date" name="required_date" type="date" value={form.required_date} onChange={onOrderChange} />
          <Input label="Shipped Date" name="shipped_date" type="date" value={form.shipped_date} onChange={onOrderChange} />
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Button onClick={saveOrder}>Save Order</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-xl font-black text-primary">Order Items</h3>
          <Button onClick={openAddItem}>Add Item</Button>
        </div>

        <DataTable
          columns={["Item", "Product", "Qty", "Price", "Discount", "Line Total", "Actions"]}
          data={order.items || []}
          renderRow={(item) => {
            const lineTotal = Number(item.quantity) * Number(item.list_price) * (1 - Number(item.discount || 0));
            return (
              <tr key={item.item_id} className="table-row-hover border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">ITM-{String(item.item_id).padStart(3, "0")}</td>
                <td className="px-4 py-3">{item.product_id}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(item.list_price)}</td>
                <td className="px-4 py-3">{Number(item.discount) * 100}%</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(lineTotal)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEditItem(item)}>Edit</Button>
                    <Button variant="danger" onClick={() => removeItem(item)}>Delete</Button>
                  </div>
                </td>
              </tr>
            );
          }}
        />

        <div className="mt-4 text-right">
          <p className="text-sm text-on-surface-variant">Order Total</p>
          <p className="text-2xl font-black text-primary">{formatCurrency(total)}</p>
        </div>
      </Card>

      <Modal open={itemModal} title={itemEditing ? "Edit Item" : "Add Item"} onClose={() => setItemModal(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Product ID" name="product_id" value={itemForm.product_id} onChange={onItemChange} />
          <Input label="Quantity" name="quantity" type="number" value={itemForm.quantity} onChange={onItemChange} />
          <Input label="List Price" name="list_price" type="number" value={itemForm.list_price} onChange={onItemChange} />
          <Input label="Discount (0-1)" name="discount" type="number" step="0.01" value={itemForm.discount} onChange={onItemChange} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setItemModal(false)}>Cancel</Button>
          <Button onClick={saveItem}>{itemEditing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
