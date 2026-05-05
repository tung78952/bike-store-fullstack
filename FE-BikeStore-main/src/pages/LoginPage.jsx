import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Input } from "../components/ui/Ui";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [payload, setPayload] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "ADMIN" ? "/dashboard" : "/orders"} replace />;
  }

  const onChange = (event) => {
    setPayload((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await login(payload);
    setLoading(false);
  };

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <Card className="hidden lg:block">
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Operations Console</p>
          <h2 className="mt-3 font-headline text-4xl font-black text-primary">Control every bicycle order with precision.</h2>
          <p className="mt-4 text-sm text-on-surface-variant">Track products, monitor staff performance, and keep order pipelines moving in one unified interface.</p>
          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-border bg-surface-2/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Realtime</p>
              <p className="mt-1 text-sm font-semibold text-primary">Live inventory and order visibility</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-2/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Role-aware</p>
              <p className="mt-1 text-sm font-semibold text-primary">Dedicated views for Admin and Staff</p>
            </div>
          </div>
        </Card>

        <Card className="w-full max-w-md justify-self-center p-7">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-on-surface-variant">Mechanical Ledger</p>
          <h1 className="mb-2 font-headline text-3xl font-black text-primary">Velos Enterprise</h1>
          <p className="mb-6 text-sm text-on-surface-variant">Sign in to continue to your control hub.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Username" name="username" value={payload.username} onChange={onChange} required />
            <Input label="Password" type="password" name="password" value={payload.password} onChange={onChange} required />
            <Button disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign In"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
