import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewRole } from '../types';
import { Smartphone, Monitor, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenOverview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOverview }) => {
  const { role, setRole, isDeviceFrame, setIsDeviceFrame, resetDemoData } = useProject();

  const navLinks: { roleKey: ViewRole | 'overview'; label: string }[] = [
    { roleKey: 'student', label: '學生端拍照' },
    { roleKey: 'professor', label: '教授端審核' },
    { roleKey: 'timeline', label: '時間軸存檔' },
    { roleKey: 'overview', label: 'MVP規格書' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, no adjacent badges) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setRole('student');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          Micro-Sync
        </a>

        {/* Zone 2: Navigation Links (single-line whitespace-nowrap) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = link.roleKey === role;
            return (
              <button
                key={link.roleKey}
                type="button"
                onClick={() => {
                  if (link.roleKey === 'overview') {
                    onOpenOverview();
                  } else {
                    setRole(link.roleKey as ViewRole);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (with viewport switcher for mobile simulation) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title={isDeviceFrame ? '切換為寬螢幕視圖' : '切換為手機模擬視圖 (iPhone)'}
          >
            {isDeviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            title="重設為範例初始資料"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置範例
          </button>
        </div>
      </div>
    </header>
  );
};
