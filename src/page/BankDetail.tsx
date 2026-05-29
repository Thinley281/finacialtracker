// page/BankDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Landmark, History, Wallet } from 'lucide-react';

export default function BankDetail() {
  const { bankName } = useParams();
  const navigate = useNavigate();
  const [bank_transactions, setBank_transactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format currency
  const fmt = (n: number) => `Nu. ${new Intl.NumberFormat('en-IN').format(n)}`;

  useEffect(() => {
    async function fetchBanksData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('bank_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('Date', { ascending: false });

          if (error) throw error;
          console.log("✅ Data:", data);
console.log("✅ User:", user.id);
console.log("✅ bankName from URL:", bankName);
          setBank_transactions(data || []);
        }
      } catch (err) {
        console.error("Error fetching bank data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanksData();
  }, [bankName]);

  // Calculate stats using real column names
  const stats = bank_transactions.reduce((acc, tx) => {
    acc.income += Number(tx.Credit) || 0;
    acc.expense += Number(tx.Debit) || 0;
    return acc;
  }, { income: 0, expense: 0 });

  // Get the latest balance from the first transaction (already sorted descending)
  const latestBalance = bank_transactions.length > 0 ? Number(bank_transactions[0].Balance) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* Header with Back Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Landmark size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{bankName}</h1>
            <p className="text-slate-500 font-medium">Account Statement & History</p>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total In</p>
          <p className="text-2xl font-black text-emerald-600">{fmt(stats.income)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Out</p>
          <p className="text-2xl font-black text-rose-600">{fmt(stats.expense)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
          <p className="text-2xl font-black text-slate-800">{fmt(latestBalance)}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-700">
            Recent Transactions
            <span className="ml-2 text-xs font-medium text-slate-400">
              ({bank_transactions.length} records)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bank_transactions.length > 0 ? (
          <div className="space-y-3">
            {bank_transactions.map((tx) => {
              const isCredit = Number(tx.Credit) > 0;
              const amount = isCredit ? Number(tx.Credit) : Number(tx.Debit);

              return (
                <div
                  key={tx.id}
                  className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {tx.Particulars}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {tx.Date} · {tx.Journal_Number}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount + Balance */}
                  <div className="text-right">
                    <p className={`text-lg font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCredit ? '+' : '-'} {fmt(amount)}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      Bal: {fmt(Number(tx.Balance))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-medium">No transactions found.</p>
            <p className="text-slate-300 text-sm">Sync your bank statement to see data here.</p>
          </div>
        )}
      </div>
    </div>
  );
}