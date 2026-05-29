import { useFinancialSummary } from '../hooks/useData';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function Home() {
  const { stats, banks, loading } = useFinancialSummary();
  const balance = banks.length > 0 ? banks[banks.length - 1].Balance : "0.00";

  if (loading) return <div className="p-10 animate-pulse text-gray-400">Syncing ledger...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 font-medium">Welcome back, Thinley Dorji</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Current Balance" val={balance} icon={<Wallet/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Income" val={stats.totalCredit} icon={<ArrowUpRight/>} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Total Expenses" val={stats.totalDebit} icon={<ArrowDownRight/>} color="text-red-600" bg="bg-red-50" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Transaction Details</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {banks.slice(-10).reverse().map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">{item.Date}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{item.Particulars}</td>
                <td className={`px-6 py-4 text-right font-bold ${item.Credit > 0 ? 'text-green-500' : 'text-gray-900'}`}>
                  {item.Credit > 0 ? `+${item.Credit}` : `-${item.Debit}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <h2 className="text-2xl font-black text-gray-900 mt-1">Nu. {val.toLocaleString()}</h2>
    </div>
  );
}