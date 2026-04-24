import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { productsApi, ordersApi, customersApi } from "../../api/services";
import { formatCurrency, orderStatusMap } from "../../utils/helpers";

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({ products: [], orders: [], customers: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length < 2) {
      setResults({ products: [], orders: [], customers: [] });
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const query = searchQuery.toLowerCase();
        const [productsRes, ordersRes, customersRes] = await Promise.all([
          productsApi.list({ limit: 50 }),
          ordersApi.list({ limit: 50 }),
          customersApi.list({ limit: 50 }),
        ]);

        const products = (productsRes.data || [])
          .filter((p) => p.product_name.toLowerCase().includes(query))
          .slice(0, 5);

        const orders = (ordersRes.data || [])
          .filter((o) => String(o.order_id).includes(query))
          .slice(0, 5);

        const customers = (customersRes.data || [])
          .filter(
            (c) =>
              c.first_name?.toLowerCase().includes(query) ||
              c.last_name?.toLowerCase().includes(query) ||
              c.email?.toLowerCase().includes(query)
          )
          .slice(0, 5);

        setResults({ products, orders, customers });
        setShowDropdown(true);
      } catch {
        /* silently fail search */
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const goTo = (path) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(path);
  };

  const hasResults = results.products.length || results.orders.length || results.customers.length;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-surface-container-lowest/85 px-4 shadow-sm backdrop-blur lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="font-headline text-xl font-extrabold tracking-tight text-primary">Bike Store Console</h1>

        <div className="relative hidden lg:block" ref={wrapperRef}>
          <div className="glass-panel min-w-[320px] items-center gap-2 rounded-full px-4 py-2 flex">
            <span className="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Search</span>
            <input
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              placeholder="Products, orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {showDropdown && hasResults ? (
            <div className="absolute left-0 top-full mt-2 w-full min-w-[400px] rounded-xl bg-surface-container-lowest shadow-diffusion ring-1 ring-outline-variant/35 overflow-hidden z-50">
              {results.products.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Products</p>
                  {results.products.map((item) => (
                    <button
                      key={`p-${item.product_id}`}
                      onClick={() => goTo("/products")}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface-container-low transition"
                    >
                      <span className="text-on-surface font-medium truncate">{item.product_name}</span>
                      <span className="ml-2 text-xs font-semibold text-primary whitespace-nowrap">{formatCurrency(item.list_price)}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.orders.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Orders</p>
                  {results.orders.map((item) => (
                    <button
                      key={`o-${item.order_id}`}
                      onClick={() => goTo(`/orders/${item.order_id}`)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface-container-low transition"
                    >
                      <span className="font-mono text-xs text-on-surface">ORD-{String(item.order_id).padStart(4, "0")}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">{orderStatusMap[item.order_status] || "Unknown"}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.customers.length > 0 && (
                <div className="pb-1">
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Customers</p>
                  {results.customers.map((item) => (
                    <button
                      key={`c-${item.customer_id}`}
                      onClick={() => goTo("/customers")}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface-container-low transition"
                    >
                      <span className="text-on-surface font-medium">{item.first_name} {item.last_name}</span>
                      <span className="ml-2 text-xs text-on-surface-variant truncate">{item.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-on-surface">{user?.first_name} {user?.last_name}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="rounded-xl bg-primary-gradient px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition active:scale-[0.98]">
          Logout
        </button>
      </div>
    </header>
  );
}
