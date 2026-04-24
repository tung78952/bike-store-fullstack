import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { brandsApi } from "../api/services";
import { Button, Card, DataTable, Input, Modal, PageHeader } from "../components/ui/Ui";
import { getErrorMessage } from "../utils/helpers";

export default function BrandsPage() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    try {
      const { data } = await brandsApi.list();
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
    setName(item.brand_name);
    setOpen(true);
  };

  const submit = async () => {
    try {
      if (editing) {
        await brandsApi.update(editing.brand_id, { brand_name: name });
        toast.success("Brand updated successfully");
      } else {
        await brandsApi.create({ brand_name: name });
        toast.success("Brand created successfully");
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete brand ${item.brand_name}?`)) return;
    try {
      await brandsApi.remove(item.brand_id);
      toast.success("Brand deleted");
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" subtitle="Manage brands" actions={<Button onClick={openCreate}>Add Brand</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Brand Portfolio</p>
          <p className="mt-2 font-headline text-3xl font-black text-primary">{rows.length} active brands</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Quality Signal</p>
          <p className="mt-2 text-sm text-on-surface-variant">Curate brand list to keep catalog premium and easy to scan.</p>
        </Card>
      </div>

      <Card>
        <DataTable
          columns={["ID", "Brand Name", "Actions"]}
          data={rows}
          renderRow={(item) => (
            <tr key={item.brand_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">BR-{String(item.brand_id).padStart(3, "0")}</td>
              <td className="px-4 py-3 font-semibold text-primary">{item.brand_name}</td>
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

      <Modal open={open} title={editing ? "Edit Brand" : "Add Brand"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Input label="Brand Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
