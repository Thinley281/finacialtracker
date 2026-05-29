import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, DollarSign, Loader2, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// FIXED: Changed currency to Nu. and added fallback for 'n'
function fmt(n: number) {
  return `Nu. ${new Intl.NumberFormat('en-IN').format(n || 0)}`;
}

// FIXED: Component now accepts transactions from props to match your Dashboard
interface FinancialStatusProps {
  bank_transactions: any[];
  loading?: boolean;
  error?: string | null;
}

export default function FinancialStatus({ bank_transactions = [], loading, error }: FinancialStatusProps) {

  // FIXED: Moved calculations into useMemo and ensured they only run if transactions exist
  const { pieData, totalIncome, totalExpense, totalBalance, totalVolume } = useMemo(() => {
    const catMap = new Map<string, number>();
    let income = 0;
    let expense = 0;
    let volume = 0;

    bank_transactions.forEach(t => {
      const amt = Math.abs(Number(t.amount) || 0);
      const type = t.type?.toLowerCase();
      const cat = t.category || (type === 'credit' ? 'Income' : 'Expense') || 'Other';

      // Aggregate for Pie Chart
      catMap.set(cat, (catMap.get(cat) ?? 0) + amt);
      volume += amt;

      // Aggregate for Stat Cards
      if (type === 'credit' || type === 'income') income += amt;
      else expense += amt;
    });

    const pieArray = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return { 
      pieData: pieArray, 
      totalIncome: income, 
      totalExpense: expense, 
      totalBalance: income - expense,
      totalVolume: volume
    };
  }, [bank_transactions]);

  const PIE_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#8b5cf6'];

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (error) return <div className="p-10 text-red-500 text-center"><AlertCircle className="mx-auto" /> {error}</div>;

  return (
    <div className="space-y-6">
      {/* Big stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={totalIncome} color="#22c55e" icon={<TrendingUp />} sub="All credits" />
        <StatCard title="Total Expense" value={totalExpense} color="#ef4444" icon={<TrendingDown />} sub="All debits" />
        <StatCard title="Total Balance" value={totalBalance} color="#6366f1" icon={<Wallet />} sub="Net Position" isBalance />
        <StatCard title="Total Volume" value={totalVolume} color="#f59e0b" icon={<DollarSign />} sub="Total movement" />
      </div>

      {/* Chart and Table Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Expense Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => fmt(Number(value) || 0)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold mb-4">Category Breakdown</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {row.name}
                  </td>
                  <td className="py-3 text-right font-bold">{fmt(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color, icon, sub, isBalance }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4" style={{ color }}>
        {icon}
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-2xl font-black ${isBalance && value < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
        {fmt(value)}
      </div>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}