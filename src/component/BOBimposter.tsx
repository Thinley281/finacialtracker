import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BoBImporter({ onComplete }: { onComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("User not authenticated");

          // MAP BOB COLUMNS TO SUPABASE COLUMNS
          // Note: Adjust 'Transaction Details' and 'Amount' based on your actual BoB CSV headers
          const formattedData = results.data.map((row: any) => {
            const amount = parseFloat(row['Amount'] || row['Debit'] || row['Credit'] || '0');
            const isIncome = row['Credit'] && parseFloat(row['Credit']) > 0;

            return {
              user_id: user.id,
              description: row['Transaction Details'] || row['Narration'] || 'BoB Transaction',
              amount: Math.abs(amount),
              type: isIncome ? 'Income' : 'Expense',
              date: new Date(row['Date'] || Date.now()).toISOString(),
              source_bank: 'Bank of Bhutan (BoB)'
            };
          });

          // Bulk Insert into Supabase
          const { error } = await supabase
            .from('transactions')
            .insert(formattedData);

          if (error) throw error;

          setStatus('success');
          onComplete(); // Refresh the dashboard list
        } catch (err) {
          console.error(err);
          setStatus('error');
        } finally {
          setUploading(false);
        }
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
      {status === 'idle' && (
        <>
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={30} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Sync BoB Statement</h3>
          <p className="text-slate-500 text-sm mb-6">Upload your .csv statement from mBoB</p>
          
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all inline-block">
            {uploading ? 'Processing...' : 'Select CSV File'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </>
      )}

      {status === 'success' && (
        <div className="animate-in zoom-in duration-300">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Sync Complete!</h3>
          <p className="text-slate-500 text-sm mb-4">Your BoB transactions are now live.</p>
          <button onClick={() => setStatus('idle')} className="text-blue-600 font-bold">Upload another</button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Upload Failed</h3>
          <p className="text-slate-500 text-sm mb-4">Check your CSV format and try again.</p>
          <button onClick={() => setStatus('idle')} className="text-blue-600 font-bold">Try Again</button>
        </div>
      )}
    </div>
  );
}