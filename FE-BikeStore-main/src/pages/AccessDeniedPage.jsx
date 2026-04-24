import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui/Ui";
import { useAuth } from "../auth/AuthContext";

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-xl text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Restricted Zone</p>
        <h1 className="mt-2 font-headline text-4xl font-black text-primary">Access Denied</h1>
        <p className="mt-3 text-on-surface-variant">You do not have permission to access this feature.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => navigate("/")}>Go to Home</Button>
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
