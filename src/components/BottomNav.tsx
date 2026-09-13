import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  Wallet, 
  Users 
} from 'lucide-react';

export type AppTab = 'dashboard' | 'meals' | 'market' | 'balance' | 'members';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'dashboard' as AppTab,
      label: 'ড্যাশবোর্ড',
      icon: LayoutDashboard,
    },
    {
      id: 'meals' as AppTab,
      label: 'মিল এন্ট্রি',
      icon: UtensilsCrossed,
    },
    {
      id: 'market' as AppTab,
      label: 'বাজার ও বিল',
      icon: ShoppingBag,
    },
    {
      id: 'balance' as AppTab,
      label: 'ব্যালেন্স শিট',
      icon: Wallet,
    },
    {
      id: 'members' as AppTab,
      label: 'মেম্বার',
      icon: Users,
    },
  ];

  return (
    <nav className="bg-slate-900 border-t border-slate-800 text-slate-400 py-1 px-2 sticky bottom-0 z-30 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-white font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/50'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-1 tracking-tight truncate ${isActive ? 'text-orange-400 font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
