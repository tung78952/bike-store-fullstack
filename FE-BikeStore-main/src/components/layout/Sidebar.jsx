import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../../utils/helpers";

const commonLinks = [
  { to: "/orders", label: "Orders" },
  { to: "/customers", label: "Customers" },
  { to: "/products", label: "Products" },
  { to: "/profile", label: "My Profile" },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/brands", label: "Brands" },
  { to: "/categories", label: "Categories" },
  { to: "/staffs", label: "Staffs" },
  { to: "/statistics", label: "Statistics" },
];

function SidebarContent({ onLinkClick }) {
  const { isAdmin } = useAuth();
  const links = isAdmin ? [...adminLinks, ...commonLinks] : commonLinks;

  return (
    <>
      <div className="mb-10">
        <p className="font-headline text-2xl font-black uppercase tracking-[-0.03em] text-primary">Velos Atelier</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Mechanical Ledger</p>
      </div>

      <nav className="space-y-1.5">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "block rounded-xl px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition",
                isActive
                  ? "bg-surface-container-lowest text-primary shadow-[inset_0_0_0_1px_rgba(194,199,209,0.32)]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[300px] flex-col bg-surface-container-low px-6 py-8 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[300px] flex-col bg-surface-container-low px-6 py-8 flex lg:hidden overflow-y-auto">
            <SidebarContent onLinkClick={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
