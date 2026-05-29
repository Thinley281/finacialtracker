import { useNavigate } from 'react-router-dom';
import { useBanks } from '../hooks/useData';
import { Building2, ChevronRight, Loader2, AlertCircle, CreditCard } from 'lucide-react';

const BANK_COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6',
];

// Reference list based on your UI requirements
const BHUTAN_BANKS = [
  "Bank of Bhutan (BoB)",
  "Bhutan National Bank (BNB)",
  "Druk PNB Bank",
  "TashiBank",
  "Bhutan Development Bank (BDBL)"
];

export default function Banks() {
  const { banks, loading, error } = useBanks();
  const navigate = useNavigate();

  // FIX: Grouping logic needs to handle the fact that 'bank_name' 
  // might be missing from the 'bank_transactions' table records.
  const grouped = (banks || []).reduce<Record<string, any[]>>((acc, b) => {
    // If the DB row has no bank_name, we can't group it effectively here
    // unless we've tagged the data during the upload phase.
    const key = b.bank_name || 'Bank of Bhutan (BoB)'; 
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  // We display the full list of Bhutan banks even if some have 0 transactions
  const displayBanks = BHUTAN_BANKS;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Institutions</h1>
          <p className="text-slate-500 font-medium mt-2">Select a bank to view statements and user-level details</p>
        </div>
        <div className="hidden md:flex gap-2">
          <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-bold text-sm">
            <CreditCard size={14} /> {displayBanks.length} Institutions
          </span>
        </div>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
          <p className="font-bold">Accessing secure bank records...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600">
          <AlertCircle size={32} />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBanks.map((name, i) => {
            const color = BANK_COLORS[i % BANK_COLORS.length];
            const transactionsForThisBank = grouped[name] || [];
            const count = transactionsForThisBank.length;

            return (
              <button
                key={name}
                className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left overflow-hidden"
                onClick={() => navigate(`/bank/${encodeURIComponent(name)}`)}
              >
                {/* Visual Accent */}
                <div 
                  className="absolute top-0 left-0 w-2 h-full" 
                  style={{ backgroundColor: color }}
                />
                
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className="p-4 rounded-2xl transition-colors" 
                    style={{ backgroundColor: color + '15', color }}
                  >
                    <Building2 size={28} />
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Active
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {name}
                  </h3>
                  <p className="text-slate-400 font-bold text-sm">
                    {count > 0 ? `${count} Transactions found` : 'No recent activity'}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">View Statement</span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}