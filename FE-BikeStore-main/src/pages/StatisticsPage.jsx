import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { statisticsApi } from "../api/services";
import { Button, Card, DataTable, Input, PageHeader, Select } from "../components/ui/Ui";
import { formatCurrency, getErrorMessage } from "../utils/helpers";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
  AreaChart, Area,
} from "recharts";

const BAR_COLORS = ["#0c2340", "#1a6b54", "#d4a574", "#5b8cb8", "#c75b39"];

export default function StatisticsPage() {
  const [limit, setLimit] = useState("10");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [periodType, setPeriodType] = useState("month");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [storeSeries, setStoreSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [highestOrders, setHighestOrders] = useState([]);

  // Staff statistics state
  const [staffCount, setStaffCount] = useState(null);
  const [staffSales, setStaffSales] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [staffData, setStaffData] = useState(null);
  const [staffMonthYear, setStaffMonthYear] = useState(String(new Date().getFullYear()));
  const [staffMonthly, setStaffMonthly] = useState([]);
  const [staffDayRange, setStaffDayRange] = useState({ start: "", end: "" });
  const [staffDaily, setStaffDaily] = useState([]);

  const loadRankings = async () => {
    try {
      const [productRes, customerRes, orderRes] = await Promise.all([
        statisticsApi.topProducts(Number(limit)),
        statisticsApi.topBuyers(Number(limit)),
        statisticsApi.highestOrders(Number(limit)),
      ]);
      setTopProducts(productRes.data.products || []);
      setTopCustomers(customerRes.data.customers || []);
      setHighestOrders(orderRes.data.orders || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStoreSeries = async () => {
    try {
      let response;
      if (periodType === "day") {
        if (!dateRange.start || !dateRange.end) {
          toast.error("Please select start/end date for daily period");
          return;
        }
        response = await statisticsApi.storeByDay(dateRange.start, dateRange.end);
      } else if (periodType === "month") {
        response = await statisticsApi.storeByMonth(Number(year));
      } else if (periodType === "quarter") {
        response = await statisticsApi.storeByQuarter(Number(year));
      } else {
        response = await statisticsApi.storeByYear();
      }
      setStoreSeries(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStaffCount = async () => {
    try {
      const { data } = await statisticsApi.staffCount();
      setStaffCount(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStaffSales = async () => {
    try {
      const { data } = await statisticsApi.staffSales();
      setStaffSales(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStaffById = async (staffId) => {
    if (!staffId) {
      setStaffData(null);
      setStaffMonthly([]);
      setStaffDaily([]);
      return;
    }
    try {
      const { data } = await statisticsApi.staffSalesById(Number(staffId));
      setStaffData(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStaffMonthly = async () => {
    if (!selectedStaffId) return;
    try {
      const { data } = await statisticsApi.staffSalesByMonth(Number(selectedStaffId), Number(staffMonthYear));
      setStaffMonthly(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadStaffDaily = async () => {
    if (!selectedStaffId || !staffDayRange.start || !staffDayRange.end) {
      toast.error("Please select staff and date range");
      return;
    }
    try {
      const { data } = await statisticsApi.staffSalesByDay(Number(selectedStaffId), staffDayRange.start, staffDayRange.end);
      setStaffDaily(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    loadRankings();
    loadStoreSeries();
    loadStaffCount();
    loadStaffSales();
  }, []);

  useEffect(() => {
    loadStaffById(selectedStaffId);
    if (selectedStaffId) {
      loadStaffMonthly();
    }
  }, [selectedStaffId]);

  const currencyFormatter = (value) => formatCurrency(value);

  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" subtitle="Advanced reports by staff and store" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Analytics Hub</p>
          <p className="mt-2 text-sm text-on-surface-variant">Tune period, limit, and dimensions to compare performance in one panel.</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Quick Insight</p>
          <p className="mt-2 text-sm text-on-surface-variant">Revenue trends are strongest when monthly volume is stable.</p>
        </Card>
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-6">
          <Select
            label="Period"
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            options={[
              { value: "day", label: "Day" },
              { value: "month", label: "Month" },
              { value: "quarter", label: "Quarter" },
              { value: "year", label: "Year" },
            ]}
          />
          <Input label="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          <Input label="Start Date" type="date" value={dateRange.start} onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))} />
          <Input label="End Date" type="date" value={dateRange.end} onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))} />
          <Input label="Top Limit" value={limit} onChange={(e) => setLimit(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button onClick={loadStoreSeries}>Load Series</Button>
            <Button variant="secondary" onClick={loadRankings}>Load Top</Button>
          </div>
        </div>
      </Card>

      {/* Store Series Chart + Table */}
      <Card>
        <h3 className="mb-4 font-headline text-xl font-black text-primary">Store Series</h3>
        {storeSeries.length > 0 && (
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeSeries} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={currencyFormatter} labelStyle={{ fontWeight: 600 }} />
                <Bar dataKey="total_revenue" fill="#0c2340" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <DataTable
          columns={["Period", "Orders", "Bikes", "Revenue", "Avg"]}
          data={storeSeries}
          renderRow={(item) => (
            <tr key={`${item.period}-${item.period_type}`} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3">{item.period}</td>
              <td className="px-4 py-3">{item.total_orders}</td>
              <td className="px-4 py-3">{item.total_bikes_sold}</td>
              <td className="px-4 py-3">{formatCurrency(item.total_revenue)}</td>
              <td className="px-4 py-3">{formatCurrency(item.avg_order_value)}</td>
            </tr>
          )}
        />
      </Card>

      {/* Top Products with Bar Chart */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-headline text-xl font-black text-primary">Top Products</h3>
          {topProducts.length > 0 && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={Math.max(180, Math.min(topProducts.length, 10) * 36 + 40)}>
                <BarChart data={topProducts.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="product_name" width={140} tick={{ fontSize: 10 }} tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + "…" : v} />
                  <Tooltip formatter={currencyFormatter} />
                  <Bar dataKey="total_revenue" radius={[0, 6, 6, 0]} name="Revenue">
                    {topProducts.slice(0, 10).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <DataTable
            columns={["Product", "Qty", "Revenue"]}
            data={topProducts}
            pageSize={10}
            renderRow={(item) => (
                <tr key={item.product_id} className="table-row-hover border-b border-slate-100">
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3">{item.total_quantity_sold}</td>
                <td className="px-4 py-3">{formatCurrency(item.total_revenue)}</td>
              </tr>
            )}
          />
        </Card>

        <Card>
          <h3 className="mb-4 font-headline text-xl font-black text-primary">Top Customers</h3>
          <DataTable
            columns={["Customer", "Orders", "Spent"]}
            data={topCustomers}
            pageSize={10}
            renderRow={(item) => (
                <tr key={item.customer_id} className="table-row-hover border-b border-slate-100">
                <td className="px-4 py-3">{item.customer_name}</td>
                <td className="px-4 py-3">{item.total_orders}</td>
                <td className="px-4 py-3">{formatCurrency(item.total_spent)}</td>
              </tr>
            )}
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-headline text-xl font-black text-primary">Highest Orders</h3>
        <DataTable
          columns={["Order", "Customer", "Date", "Value", "Items"]}
          data={highestOrders}
          pageSize={10}
          renderRow={(item) => (
            <tr key={item.order_id} className="table-row-hover border-b border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">ORD-{String(item.order_id).padStart(4, "0")}</td>
              <td className="px-4 py-3">{item.customer_name}</td>
              <td className="px-4 py-3">{item.order_date}</td>
              <td className="px-4 py-3">{formatCurrency(item.order_value)}</td>
              <td className="px-4 py-3">{item.items_count}</td>
            </tr>
          )}
        />
      </Card>

      {/* Staff Statistics Section */}
      <Card>
        <h3 className="mb-4 font-headline text-xl font-black text-primary">Staff Statistics</h3>

        {/* Staff Count Summary Cards */}
        {staffCount && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Total Staff</p>
              <p className="mt-1 text-2xl font-black text-primary">{staffCount.total_staffs || 0}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Active Staff</p>
              <p className="mt-1 text-2xl font-black text-primary">{staffCount.active_staffs || 0}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Inactive Staff</p>
              <p className="mt-1 text-2xl font-black text-primary">{staffCount.inactive_staffs || 0}</p>
            </div>
          </div>
        )}

        {/* Staff Selector */}
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Select
            label="Select Staff"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            options={[
              { value: "", label: "-- Select a staff member --" },
              ...staffSales.map((s) => ({ value: String(s.staff_id), label: `${s.staff_name} (ID: ${s.staff_id})` })),
            ]}
          />
        </div>

        {/* Staff Summary Cards */}
        {staffData ? (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card><p className="text-xs uppercase text-on-surface-variant">Staff</p><p className="mt-1 font-semibold">{staffData.staff_name}</p></Card>
            <Card><p className="text-xs uppercase text-on-surface-variant">Orders</p><p className="mt-1 font-semibold">{staffData.total_orders}</p></Card>
            <Card><p className="text-xs uppercase text-on-surface-variant">Bikes</p><p className="mt-1 font-semibold">{staffData.total_bikes_sold}</p></Card>
            <Card><p className="text-xs uppercase text-on-surface-variant">Revenue</p><p className="mt-1 font-semibold">{formatCurrency(staffData.total_revenue)}</p></Card>
          </div>
        ) : (
          <p className="mb-6 text-sm text-on-surface-variant">Enter staff ID to view statistics.</p>
        )}

        {/* Staff Monthly Chart */}
        {selectedStaffId && (
          <div className="mb-6">
            <div className="mb-3 flex items-end gap-3">
              <Input label="Year" value={staffMonthYear} onChange={(e) => setStaffMonthYear(e.target.value)} />
              <Button onClick={loadStaffMonthly}>Load Monthly</Button>
            </div>
            {staffMonthly.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={staffMonthly} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={currencyFormatter} labelStyle={{ fontWeight: 600 }} />
                  <Line type="monotone" dataKey="total_revenue" stroke="#0c2340" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Staff Daily Chart */}
        {selectedStaffId && (
          <div>
            <div className="mb-3 flex items-end gap-3 flex-wrap">
              <Input label="Start Date" type="date" value={staffDayRange.start} onChange={(e) => setStaffDayRange((p) => ({ ...p, start: e.target.value }))} />
              <Input label="End Date" type="date" value={staffDayRange.end} onChange={(e) => setStaffDayRange((p) => ({ ...p, end: e.target.value }))} />
              <Button onClick={loadStaffDaily}>Load Daily</Button>
            </div>
            {staffDaily.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={staffDaily} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={currencyFormatter} labelStyle={{ fontWeight: 600 }} />
                  <Area type="monotone" dataKey="total_revenue" stroke="#1a6b54" fill="#1a6b54" fillOpacity={0.15} strokeWidth={2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
