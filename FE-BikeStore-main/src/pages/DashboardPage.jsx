import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { statisticsApi } from "../api/services";
import { Card, DataTable, PageHeader } from "../components/ui/Ui";
import { formatCurrency, getErrorMessage } from "../utils/helpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [staffSales, setStaffSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, staffRes, productsRes, customersRes] = await Promise.all([
        statisticsApi.storeOverview(),
        statisticsApi.staffSales(),
        statisticsApi.topProducts(5),
        statisticsApi.topBuyers(5),
      ]);
      setOverview(overviewRes.data);
      setStaffSales(staffRes.data || []);
      setTopProducts(productsRes.data.products || []);
      setTopCustomers(customersRes.data.customers || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currencyFormatter = (value) => formatCurrency(value);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Revenue overview and operational performance" />

      {loading ? <p className="text-on-surface-variant">Loading dashboard...</p> : null}

      {overview ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Store Revenue</p>
            <p className="mt-3 font-headline text-4xl font-black tracking-tight text-primary">{formatCurrency(overview.total_revenue)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Orders</p>
                <p className="mt-1 text-xl font-black text-primary">{overview.total_orders}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Bikes Sold</p>
                <p className="mt-1 text-xl font-black text-primary">{overview.total_bikes_sold}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Avg Ticket</p>
                <p className="mt-1 text-xl font-black text-primary">{formatCurrency(overview.avg_order_value)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Store Snapshot</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
                <span className="text-sm text-on-surface-variant">Customers</span>
                <span className="font-mono text-sm font-bold text-primary">{overview.total_customers}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
                <span className="text-sm text-on-surface-variant">Products</span>
                <span className="font-mono text-sm font-bold text-primary">{overview.total_products}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
                <span className="text-sm text-on-surface-variant">Status</span>
                <span className="rounded-full bg-secondary/15 px-2 py-1 text-xs font-bold text-secondary">Stable</span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-headline text-xl font-black text-primary">Staff Sales</h3>
          {staffSales.length > 0 && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={staffSales} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="staff_name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={currencyFormatter} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="total_revenue" fill="#0c2340" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <DataTable
            columns={["Staff", "Orders", "Bikes", "Revenue"]}
            data={staffSales}
            renderRow={(item) => (
              <tr key={item.staff_id} className="border-b border-slate-100">
                <td className="px-4 py-3">{item.staff_name}</td>
                <td className="px-4 py-3">{item.total_orders}</td>
                <td className="px-4 py-3">{item.total_bikes_sold}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(item.total_revenue)}</td>
              </tr>
            )}
          />
        </Card>

        <Card>
          <h3 className="mb-4 font-headline text-xl font-black text-primary">Top Products</h3>
          <DataTable
            columns={["Product", "Qty Sold", "Revenue"]}
            data={topProducts}
            renderRow={(item) => (
              <tr key={item.product_id} className="border-b border-slate-100">
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3">{item.total_quantity_sold}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(item.total_revenue)}</td>
              </tr>
            )}
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-headline text-xl font-black text-primary">Top Customers</h3>
        <DataTable
          columns={["Customer", "Email", "Orders", "Total Spent"]}
          data={topCustomers}
          renderRow={(item) => (
            <tr key={item.customer_id} className="border-b border-slate-100">
              <td className="px-4 py-3">{item.customer_name}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">{item.total_orders}</td>
              <td className="px-4 py-3 font-semibold">{formatCurrency(item.total_spent)}</td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}
