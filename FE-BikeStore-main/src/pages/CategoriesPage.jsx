import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { categoriesApi } from "../api/services";
import { Button, Card, DataTable, Input, Modal, PageHeader } from "../components/ui/Ui";
import { getErrorMessage } from "../utils/helpers";

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    try {
      const { data } = await categoriesApi.list();
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
    setName("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.category_name);
    setOpen(true);
  };

  const submit = async () => {
    try {
      if (editing) {
        await categoriesApi.update(editing.category_id, { category_name: name });
        toast.success("Category updated successfully");
      } else {
        await categoriesApi.create({ category_name: name });
        toast.success("Category created successfully");
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete category ${item.category_name}?`)) return;
    try {
      await categoriesApi.remove(item.category_id);
      toast.success("Category deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Manage product categories" actions={<Button onClick={openCreate}>Add Category</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Catalog Structure</p>
          <p className="mt-2 font-headline text-3xl font-black text-primary">{rows.length} category groups</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Taxonomy Note</p>
          <p className="mt-2 text-sm text-on-surface-variant">Keep category tree compact for better filter experience.</p>
        </Card>
      </div>

      <Card>
        <DataTable
          columns={["ID", "Category Name", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.category_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">CAT-{String(item.category_id).padStart(3, "0")}</td>
              <td className="px-4 py-3 font-semibold text-primary">{item.category_name}</td>
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

      <Modal open={open} title={editing ? "Edit Category" : "Add Category"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
