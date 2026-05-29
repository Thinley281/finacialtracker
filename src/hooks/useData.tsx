import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBanks() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error: supabaseError } = await supabase
            .from('bank_transactions') 
            .select('*')
            .eq('user_id', user.id)
            .order('id', { ascending: true });

          if (supabaseError) throw supabaseError;

          if (data) {
            // We define 'mappedData' inside this block so it is accessible
            const mappedData = data.map(row => ({
              ...row,
              amount: Number(row.Debit) > 0 ? Number(row.Debit) : Number(row.Credit),
              type: Number(row.Debit) > 0 ? 'debit' : 'credit',
              // Use the actual columns from your screenshot
              description: row.Particulars,
              date: row.Date
            }));
            
            console.log("Data loaded successfully:", mappedData.length, "rows");
            setBanks(mappedData);
          }
        }
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { banks, loading, error };
}

export function useFinancialSummary() {
  const { banks, loading, error } = useBanks();
  
  // This calculates the totals for your dashboard cards
  const stats = banks.reduce((acc, item) => {
    if (item.type === 'credit') acc.totalCredit += item.amount;
    if (item.type === 'debit') acc.totalDebit += item.amount;
    return acc;
  }, { totalCredit: 0, totalDebit: 0 });

  return { 
    stats, 
    loading, 
    error,
    banks, 
    totalBalance: stats.totalCredit - stats.totalDebit 
  };
}