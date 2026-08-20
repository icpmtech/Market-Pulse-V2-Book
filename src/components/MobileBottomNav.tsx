import React from 'react';
import {
  LineChart,
  Activity,
  BarChart3,
  Users,
  Briefcase,
  Search,
  Star,
  Mail,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenGmailShare?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenGmailShare,
}) => {
  const tabs = [
    { id: 'chart', label: 'Gráfico', icon: LineChart, color: 'text-sky-400' },
    { id: 'technical', label: 'Técnica', icon: Activity, color: 'text-emerald-400' },
    { id: 'fundamental', label: 'Fundamental', icon: BarChart3, color: 'text-indigo-400' },
    { id: 'analysts', label: 'Consenso', icon: Users, color: 'text-purple-400' },
    { id: 'portfolio', label: 'Carteira', icon: Briefcase, color: 'text-pink-400' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-1.5 py-1.5 shadow-2xl pb-[env(safe-area-inset-bottom,8px)]">
      <div className="grid grid-cols-6 items-center justify-between text-[10px]">
        {/* Search button on mobile bottom bar */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-sky-400 active:scale-95 transition min-h-[44px]"
        >
          <Search className="w-5 h-5 mb-0.5 text-sky-400" />
          <span className="font-medium text-[10px] truncate max-w-[50px]">Buscar</span>
        </button>

        {/* Tab items */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition min-h-[44px] relative ${
                isActive
                  ? `${tab.color} font-bold`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? tab.color : 'text-slate-400'}`} />
              <span className="text-[10px] truncate max-w-[52px]">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-sky-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
