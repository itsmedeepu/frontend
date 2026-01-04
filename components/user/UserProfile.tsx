import React from 'react';

interface UserProfileProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  setUserData: (data: any) => void;
  onUpdateProfile: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userData, setUserData, onUpdateProfile }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300 transition-colors">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Personal Information</h3>
      <div className="max-w-xl space-y-6">
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input 
                type="text" 
                value={userData.name} 
                onChange={e => setUserData({...userData, name: e.target.value})} 
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input 
                type="email" 
                value={userData.email} 
                onChange={e => setUserData({...userData, email: e.target.value})} 
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={userData.phone} 
                onChange={e => setUserData({...userData, phone: e.target.value})} 
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Address</label>
              <textarea 
                rows={3}
                value={userData.address} 
                onChange={e => setUserData({...userData, address: e.target.value})} 
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
              />
            </div>
         </div>
         <button 
           onClick={onUpdateProfile} 
           className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md active:scale-95"
         >
           Update Profile
         </button>
      </div>
    </div>
  );
};

export default UserProfile;
