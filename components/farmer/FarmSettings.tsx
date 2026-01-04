import React from 'react';
import { UserContext } from '../../context/UserContext'; 

interface FarmSettingsProps {
  farmSettings: { name: string; loc: string; desc: string };
  setFarmSettings: (settings: any) => void;
  onUpdateProfile: () => void;
  userData: { name: string; email: string; phone: string };
  setUserData: (data: any) => void;
  passwordForm: any;
  setPasswordForm: (data: any) => void;
  onUpdatePassword: (e: React.FormEvent) => void;
}

const FarmSettings: React.FC<FarmSettingsProps> = ({ 
  farmSettings, 
  setFarmSettings, 
  onUpdateProfile,
  userData,
  setUserData,
  passwordForm,
  setPasswordForm,
  onUpdatePassword
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300 transition-colors">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Farm Business Profile</h3>
      <div className="max-w-xl space-y-6">
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Legal Farm Name</label>
              <input 
                type="text" 
                value={farmSettings.name} 
                disabled
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Market Location</label>
              <input 
                type="text" 
                value={farmSettings.loc} 
                onChange={e => setFarmSettings({...farmSettings, loc: e.target.value})} 
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Public Description</label>
               <textarea 
                 rows={4} 
                 value={farmSettings.desc} 
                 onChange={e => setFarmSettings({...farmSettings, desc: e.target.value})} 
                 className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
               />
             </div>
          </div>
          
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">My Personal Details</h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={userData.name} 
                  onChange={e => setUserData({...userData, name: e.target.value})} 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={userData.email} 
                  onChange={e => setUserData({...userData, email: e.target.value})} 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={userData.phone} 
                  onChange={e => setUserData({...userData, phone: e.target.value})} 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                />
              </div>
           Update Business & Personal Info
         </button>
         
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Security</h3>
           <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                 <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                 <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                  value={passwordForm.confirmNewPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                />
              </div>
              <button 
              onClick={onUpdatePassword} 
              className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-md active:scale-95"
             >
               Update Password
             </button>
           </div>
      </div>
    </div>
  );
};

export default FarmSettings;
