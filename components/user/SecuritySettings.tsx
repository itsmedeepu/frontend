import React from 'react';

interface SecuritySettingsProps {
  passwordForm: {
    current: string;
    new: string;
    confirm: string;
  };
  setPasswordForm: (data: any) => void;
  onUpdatePassword: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ passwordForm, setPasswordForm, onUpdatePassword }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300 transition-colors">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Security Settings</h3>
      <div className="max-w-xl space-y-6">
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input 
                type="password" 
                value={passwordForm.current}
                onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input 
                type="password" 
                value={passwordForm.new}
                onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
         </div>
         <button 
           onClick={onUpdatePassword} 
           className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-md active:scale-95"
         >
           Update Password
         </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
