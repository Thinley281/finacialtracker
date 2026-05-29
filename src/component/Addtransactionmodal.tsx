// src/components/AddTransactionModal.tsx
import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface AddTransactionModalProps {
  onClose: () => void;
}

// Keeping types lowercase to match your FinancialStatus logic
type TransactionType = 'income' | 'expense';

export default function AddTransactionModal({ onClose }: AddTransactionModalProps) {
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDesc] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const categories: string[] = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Salary', 'Other'];

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError("You must be logged in to add a transaction.");
      return;
    }

    setLoading(true);

    try {
      const { error: supabaseError } = await supabase.from('bank_transactions').insert([{
        user_id: user.id,
        user_email: user.email, // Added to ensure compatibility with your fetch filters
        type: type, // Will save as 'income' or 'expense'
        amount: parseFloat(amount),
        description: description,
        category: category,
        date: date,
      }]);

      if (supabaseError) throw supabaseError;
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">New Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Improved Toggle Switch */}
        <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-6">
          {(['income', 'expense'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-200
                ${type === t 
                  ? (t === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg') 
                  : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Amount (Nu.)</label>
            <input
              type="number" step="0.01" min="0" required
              value={amount} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <input
              type="text" required
              value={description} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDesc(e.target.value)}
              placeholder="What was this for?"
              className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select
                value={category} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
              <input
                type="date" required
                value={date} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 mt-2"
          >
            {loading ? 'Processing...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}