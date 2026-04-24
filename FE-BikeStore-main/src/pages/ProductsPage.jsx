import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { brandsApi, categoriesApi, productsApi } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, DataTable, Input, Modal, PageHeader, Select } from "../components/ui/Ui";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

const defaultForm = {
  product_name: "",
  brand_id: "",
  category_id: "",
  model_year: "",
  list_price: "",
  stock: "0",
};

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ brand_id: "", category_id: "" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const brandMap = useMemo(() => Object.fromEntries(brands.map((i) => [i.brand_id, i.brand_name])), [brands]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((i) => [i.category_id, i.category_name])), [categories]);

  const loadOptions = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([brandsApi.list(), categoriesApi.list()]);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadData = async () => {
    try {
      const params = {};
      if (filters.brand_id) params.brand_id = Number(filters.brand_id);
      if (filters.category_id) params.category_id = Number(filters.category_id);
      const { data } = await productsApi.list(params);
      setRows(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters.brand_id, filters.category_id]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      product_name: item.product_name,
      brand_id: String(item.brand_id),
      category_id: String(item.category_id),
      model_year: String(item.model_year),
      list_price: String(item.list_price),
      stock: String(item.stock ?? 0),
    });
    setOpen(true);
  };

  const onFormChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async () => {
    try {
      const payload = {
        product_name: form.product_name,
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        model_year: Number(form.model_year),
        list_price: Number(form.list_price),
        stock: Number(form.stock),
      };

      if (editing) {
        await productsApi.update(editing.product_id, payload);
        toast.success("Product updated successfully");
      } else {
        await productsApi.create(payload);
        toast.success("Product created successfully");
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete product ${item.product_name}?`)) return;
    try {
      await productsApi.remove(item.product_id);
      toast.success("Product deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage products and inventory"
        actions={isAdmin ? <Button onClick={openCreate}>Add Product</Button> : null}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Inventory Snapshot</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Products</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Low Stock</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => Number(x.stock) <= 5).length}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">High Value</p>
              <p className="mt-1 text-2xl font-black text-primary">{rows.filter((x) => Number(x.list_price) >= 50000000).length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">View Mode</p>
          <p className="mt-2 text-sm text-on-surface-variant">Data-first layout with sharp taxonomy and no visual clutter.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Select
            label="Brand"
            value={filters.brand_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, brand_id: e.target.value }))}
            options={[{ value: "", label: "All Brands" }, ...brands.map((x) => ({ value: String(x.brand_id), label: x.brand_name }))]}
          />
          <Select
            label="Category"
            value={filters.category_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, category_id: e.target.value }))}
            options={[{ value: "", label: "All Categories" }, ...categories.map((x) => ({ value: String(x.category_id), label: x.category_name }))]}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setFilters({ brand_id: "", category_id: "" })}>Reset Filters</Button>
          </div>
        </div>

        <DataTable
          columns={["ID", "Name", "Brand", "Category", "Year", "Price", "Stock", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.product_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">PRD-{String(item.product_id).padStart(3, "0")}</td>
              <td className="px-4 py-3 font-semibold text-primary">{item.product_name}</td>
              <td className="px-4 py-3">{brandMap[item.brand_id] || item.brand_id}</td>
              <td className="px-4 py-3">{categoryMap[item.category_id] || item.category_id}</td>
              <td className="px-4 py-3 font-mono text-xs">{item.model_year}</td>
              <td className="px-4 py-3 font-semibold">{formatCurrency(item.list_price)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">{item.stock}</span>
              </td>
              <td className="px-4 py-3">
                {isAdmin ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                    <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant">Read only</span>
                )}
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal open={open} title={editing ? "Edit Product" : "Add Product"} onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Product Name" name="product_name" value={form.product_name} onChange={onFormChange} />
          <Input label="Model Year" name="model_year" type="number" value={form.model_year} onChange={onFormChange} />
          <Select
            label="Brand"
            name="brand_id"
            value={form.brand_id}
            onChange={onFormChange}
            options={[{ value: "", label: "Select brand" }, ...brands.map((x) => ({ value: String(x.brand_id), label: x.brand_name }))]}
          />
          <Select
            label="Category"
            name="category_id"
            value={form.category_id}
            onChange={onFormChange}
            options={[{ value: "", label: "Select category" }, ...categories.map((x) => ({ value: String(x.category_id), label: x.category_name }))]}
          />
          <Input label="List Price" name="list_price" type="number" value={form.list_price} onChange={onFormChange} />
          <Input label="Stock" name="stock" type="number" value={form.stock} onChange={onFormChange} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
