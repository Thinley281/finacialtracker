import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface FinancialChartProps {
  bank_transactions: any[];
}

// Format currency to Ngultrum (Nu.)
function fmt(n: number) {
  return `Nu. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(n)}`;
}

const CHART_TYPES = ['Area', 'Bar', 'Line'] as const;
type ChartType = typeof CHART_TYPES[number];

export default function FinancialChart({ bank_transactions }: FinancialChartProps) {
  const [chartType, setChartType] = useState<ChartType>('Area');

  // Logic to process transactions into monthly chart data
  const { chartData, totalIncome, totalExpense } = useMemo(() => {
    const monthlyData: { [key: string]: { month: string; income: number; expense: number; net: number } } = {};

    bank_transactions.forEach(tx => {
      const date = new Date(tx.date);
      // Format as "Jan 2024"
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, income: 0, expense: 0, net: 0 };
      }

      const amount = Number(tx.amount || 0);
      const type = tx.type?.toLowerCase();

      if (type === 'income' || type === 'credit') {
        monthlyData[monthYear].income += amount;
      } else if (type === 'expense' || type === 'debit') {
        monthlyData[monthYear].expense += amount;
      }
      
      monthlyData[monthYear].net = monthlyData[monthYear].income - monthlyData[monthYear].expense;
    });

    // Convert map to sorted array
    const sortedData = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    const totalIncome = sortedData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = sortedData.reduce((acc, curr) => acc + curr.expense, 0);

    return { 
      chartData: sortedData, 
      totalIncome, 
      totalExpense, 
      totalBalance: totalIncome - totalExpense 
    };
  }, [bank_transactions]);

  const tooltipStyle = {
    contentStyle: { 
      background: '#ffffff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
    },
    itemStyle: { fontSize: '12px', fontWeight: 'bold' },
    formatter: (value: any) => fmt(Number(value) || 0),
  };

  const renderChart = () => {
    if (chartData.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <BarChart3 size={40} className="text-slate-300 mb-2" />
        <p className="text-slate-400 font-medium">No data to visualize yet</p>
      </div>
    );

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    const axis = (
      <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
        <YAxis hide />
        <Tooltip {...tooltipStyle} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
      </>
    );

    if (chartType === 'Bar') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart {...commonProps}>
            {axis}
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" barSize={20} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'Line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart {...commonProps}>
            {axis}
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} name="Expense" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          {axis}
          <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} name="Income" />
          <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} name="Expense" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
          <p className="text-xl font-bold text-emerald-600">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expense</p>
          <p className="text-xl font-bold text-rose-600">{fmt(totalExpense)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Points</p>
          <p className="text-xl font-bold text-slate-700">{bank_transactions.length} txns</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe</p>
          <p className="text-xl font-bold text-slate-700">{chartData.length} Months</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Growth Analysis</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {CHART_TYPES.map(t => (
              <button 
                key={t} 
                onClick={() => setChartType(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[320px] w-full">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}