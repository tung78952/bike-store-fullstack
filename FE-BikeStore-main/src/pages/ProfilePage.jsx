import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Input, PageHeader } from "../components/ui/Ui";
import { getErrorMessage } from "../utils/helpers";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
      }
      await authApi.updateProfile(payload);
      toast.success("Profile updated successfully");
      await refreshMe();
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Update personal information" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 max-w-none">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Identity Card</p>
          <p className="mt-2 text-sm text-on-surface-variant">Update personal details and keep access information accurate.</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Current Role</p>
          <p className="mt-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">{user?.role}</p>
        </Card>
      </div>

      <Card className="max-w-3xl">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First Name" name="first_name" value={form.first_name} onChange={onChange} />
            <Input label="Last Name" name="last_name" value={form.last_name} onChange={onChange} />
          </div>
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
          <Input label="Email (Read Only)" value={user?.email || ""} readOnly />
          <Input label="New Password" type="password" name="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep current password" />
          <div className="flex justify-end">
            <Button disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
