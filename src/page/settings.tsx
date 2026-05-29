import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

const Settings = () => {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    cid: '', // We keep this as 'cid' in state for simplicity
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // --- 1. LOAD DATA FROM SUPABASE ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error: dbError } = await supabase
            .from('profiles')
            .select('first_name, last_name, age, cid_number') // Correct column name
            .eq('id', user.id)
            .single();

          if (dbError && dbError.code !== 'PGRST116') throw dbError;

          if (data) {
            setFormData(prev => ({
              ...prev,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              age: data.age?.toString() || '',
              cid: data.cid_number || '' // Map cid_number to our 'cid' state
            }));
          }
        }
      } catch (err: any) {
        console.error("Error loading profile:", err.message);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // --- 2. VALIDATIONS ---
    const cidRegex = /^\d{11}$/;
    if (!cidRegex.test(formData.cid)) {
      setError('CID Number must be exactly 11 digits.');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    // --- 3. SAVE DATA TO SUPABASE ---
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: parseInt(formData.age),
          cid_number: formData.cid, // MUST match SQL column name exactly
          updated_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      if (formData.newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (authError) throw authError;
      }

      setSuccess(true);
      // Clear password fields after success
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4">
          {formData.firstName ? formData.firstName[0].toUpperCase() : 'U'}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
        <p className="text-slate-500 text-sm">Update your Bhutanese ID and personal details</p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
            <input 
              type="text" 
              value={formData.firstName}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              onChange={(e) => updateField('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
            <input 
              type="text" 
              value={formData.lastName}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              onChange={(e) => updateField('lastName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
            <input 
              type="number" 
              value={formData.age}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
              onChange={(e) => updateField('age', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">CID Number</label>
            <input 
              type="text" 
              placeholder="11-digit ID"
              value={formData.cid}
              onChange={(e) => updateField('cid', e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-50">
          <h3 className="font-bold text-slate-800 mb-4">Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="password" 
              placeholder="New Password" 
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              value={formData.newPassword}
              onChange={(e) => updateField('newPassword', e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;