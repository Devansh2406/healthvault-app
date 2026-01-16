import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Bell, User, Plus, Bot, MapPin } from 'lucide-react';
import { useTranslation } from '@/app/hooks/useTranslation';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: MapPin, label: t('nearby'), path: '/nearby' },
    { icon: Bot, label: t('assistant'), path: '/assistant' },
    { icon: FolderOpen, label: t('vault'), path: '/reports' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[500]">
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-1 flex-1 transition-colors ${index === 2 ? 'relative' : ''
                }`}
            >
              {index === 2 ? (
                <>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#00D66C] to-[#00E5FF] rounded-full flex items-center justify-center shadow-xl border-4 border-[#F8FAFC]">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="h-5" />
                  <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-[#00D66C]' : 'text-gray-500'}`}>{item.label}</span>
                </>
              ) : (
                <>
                  <item.icon
                    className={`w-6 h-6 transition-colors ${isActive ? 'text-[#00D66C]' : 'text-gray-400'
                      }`}
                  />
                  <span
                    className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-[#00D66C]' : 'text-gray-500'
                      }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
