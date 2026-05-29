import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Home, Landmark, ChevronRight, Loader2, 
  BarChart3, Settings as SettingsIcon, LogOut, User 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const FinancialStatus = lazy(() => import('./finacialstatus'));
const Settings = lazy(() => import('./settings'));
const FinancialChart = lazy(() => import('./financialchart'));

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string; 
  date: string;
  category?: string;
  bank_name?: string; // Added to help identify bank-specific data
}

type TabType = 'home' | 'bank' | 'status'| 'chart' | 'settings';

const BHUTAN_BANKS: string[] = [
  "Bank of Bhutan (BoB)",
  "Bhutan National Bank (BNB)",
  "Druk PNB Bank",
  "TashiBank",
  "Bhutan Development Bank (BDBL)"
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [bank_transactions, setBank_Transactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const fetchbank_transactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setBank_Transactions((data as Transaction[]) || []);
    } catch (error: any) {
      console.error('Error fetching bank_transactions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchbank_transactions();

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transactions' }, 
        () => fetchbank_transactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Landmark size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FinInsight</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={<Landmark size={20} />} label="Banks" active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} />
          <SidebarItem icon={<BarChart3 size={20} />} label="Status" active={activeTab === 'status'} onClick={() => setActiveTab('status')} />
          <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'chart'} onClick={() => setActiveTab('chart')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="font-semibold text-slate-700 capitalize">{activeTab} View</h1>
          
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User size={18} /></div>
                <span className="text-sm font-medium text-slate-600">My Account</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2">
                <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"><SettingsIcon size={16} className="mr-2" /> Settings</button>
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"><LogOut size={16} className="mr-2" /> Logout</button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p>Loading your finances...</p>
            </div>
          ) : activeTab === 'home' ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Recent Activity</h2>
              <div className="grid gap-3">
                {bank_transactions.length > 0 ? (
                  bank_transactions.map((tx) => (
                    <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                          <div className="bg-slate-50 p-3 rounded-xl"><ChevronRight size={18} className="text-slate-400" /></div>
                          <div>
                            <p className="font-bold text-slate-800">{tx.description}</p>
                            <p className="text-xs text-slate-400">{tx.date} • {tx.bank_name || 'Manual'}</p>
                          </div>
                      </div>
                      <span className={tx.type.toLowerCase() === 'income' || tx.type.toLowerCase() === 'credit' ? 'text-emerald-600 font-bold text-lg' : 'text-rose-500 font-bold text-lg'}>
                        {tx.type.toLowerCase() === 'income' || tx.type.toLowerCase() === 'credit' ? '+' : '-'} Nu. {Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                    No transactions found.
                  </div>
                )}
              </div>
            </section>
          ) : activeTab === 'status' ? (
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>}>
              <FinancialStatus bank_transactions={bank_transactions} />
            </Suspense>
          ) : activeTab === 'chart' ? (
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>}>
              <FinancialChart bank_transactions={bank_transactions} />
            </Suspense>
          ) : activeTab === 'bank' ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-bold mb-8 text-slate-900">Partner Banks</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BHUTAN_BANKS.map(bank => (
                  <button 
                    key={bank} 
                    onClick={() => navigate(`/bank/${encodeURIComponent(bank)}`)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group text-left"
                  >
                    <div className="bg-blue-50 p-4 rounded-2xl mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Landmark className="text-blue-600 group-hover:text-white transition-colors" size={24} /> 
                    </div>
                    <div>
                      <span className="block font-black text-xl text-slate-800">{bank}</span>
                      <span className="text-sm text-slate-400 font-medium italic">View detailed statement →</span>
                    </div>
                  </button>
                ))}
               </div>
            </section>
          ) : (
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>}>
              <Settings />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center w-full p-4 rounded-2xl mb-1 transition-all ${
      active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
      : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon} <span className="ml-4 font-bold">{label}</span>
  </button>
);