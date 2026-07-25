import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FolderLock,
  Search,
  Gavel,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cases', label: 'Active Cases', icon: Briefcase },
  { path: '/analyze', label: 'Evidence Vault', icon: FolderLock },
  { path: '/precedents', label: 'Precedent Search', icon: Search },
  { path: '/hearings', label: 'Hearings', icon: Gavel },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#101820] border-r border-[#1A2530] transition-all duration-200 ease-in-out flex flex-col justify-between overflow-hidden select-none shadow-[2px_0_10px_rgba(0,0,0,0.1)] ${
        isHovered ? 'w-[220px]' : 'w-[64px]'
      }`}
    >
      {/* Top: Startuop Wordmark */}
      <div className="h-16 flex items-center px-5 border-b border-[#1A2530] shrink-0">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <span className="font-serif italic text-lg text-white tracking-tight whitespace-nowrap">
            Startuop
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center h-12 px-5 transition-all duration-150 ease-out group ${
                active
                  ? 'border-l-2 border-[#007BFF] bg-[#1A2530]'
                  : 'border-l-2 border-transparent hover:bg-[#1A2530]/50'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? 'text-[#007BFF]' : 'text-[#A0AEC0] group-hover:text-white'
                }`} 
                strokeWidth={1.5} 
              />
              
              <span
                className={`ml-4 text-sm font-normal whitespace-nowrap transition-all duration-150 ease-out group-hover:translate-x-1 ${
                  active ? 'text-white' : 'text-[#A0AEC0] group-hover:text-white'
                } ${
                  isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Avatar & Logout */}
      <div className="p-3 border-t border-[#1A2530] shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-[#1A2530] border border-[#2D3748] text-[#007BFF] font-mono text-xs font-semibold flex items-center justify-center shrink-0">
            M
          </div>
          {isHovered && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-xs text-white font-medium truncate">Emily R.</p>
              <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wider font-mono truncate">Esq. / Partner</p>
            </div>
          )}
        </div>

        {isHovered && (
          <button
            type="button"
            title="Sign Out"
            className="text-[#A0AEC0] hover:text-white transition-colors p-1 shrink-0"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </aside>
  );
}
