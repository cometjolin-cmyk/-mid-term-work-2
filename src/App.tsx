import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { StudentCaptureView } from './components/StudentCaptureView';
import { ProfessorReviewView } from './components/ProfessorReviewView';
import { TimelineArchiveView } from './components/TimelineArchiveView';
import { LineNotificationBanner } from './components/LineNotificationBanner';
import { MvpSpecModal } from './components/MvpSpecModal';
import { Camera, CheckSquare, Clock, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, setRole, isDeviceFrame, setActiveReviewToken } = useProject();
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  // Check URL query parameters on load to support real magic links like ?token=xxx&role=professor
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const urlRole = params.get('role');
      if (token) {
        setActiveReviewToken(token);
        if (urlRole === 'professor' || !urlRole) {
          setRole('professor');
        }
      }
    } catch {
      // URL parsing fallback
    }
  }, [setActiveReviewToken, setRole]);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Top Bar adhering to the Top Bar Contract */}
      <Navbar onOpenOverview={() => setIsSpecModalOpen(true)} />

      {/* Floating LINE notification simulation */}
      <LineNotificationBanner />

      {/* MVP Spec Modal */}
      <MvpSpecModal isOpen={isSpecModalOpen} onClose={() => setIsSpecModalOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        {isDeviceFrame ? (
          /* Phone Frame Mockup for testing mobile ergonomics & thumb zone */
          <div className="flex flex-col items-center justify-center my-2 animate-fade-in">
            <div className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1.5">
              <span>手機視圖模擬 (Mobile Viewport 390px)</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsSpecModalOpen(true)}
                className="text-indigo-600 hover:underline font-semibold"
              >
                查看 MVP 假說規格
              </button>
            </div>

            <div className="w-full max-w-[400px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 relative">
              {/* Phone Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-950" />
              </div>

              {/* Inner viewport container */}
              <div className="bg-slate-50 rounded-[34px] overflow-hidden min-h-[640px] max-h-[740px] overflow-y-auto p-3">
                {role === 'student' && <StudentCaptureView />}
                {role === 'professor' && <ProfessorReviewView />}
                {role === 'timeline' && <TimelineArchiveView />}
              </div>

              {/* Phone Bottom Home Indicator */}
              <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>
          </div>
        ) : (
          /* Responsive Desktop/Tablet Layout */
          <div className="max-w-5xl mx-auto">
            {role === 'student' && <StudentCaptureView />}
            {role === 'professor' && <ProfessorReviewView />}
            {role === 'timeline' && <TimelineArchiveView />}
          </div>
        )}
      </main>

      {/* Clean Unboxed Footer with Quiet Metadata */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Micro-Sync 專案微同步</span>
            <span aria-hidden="true">·</span>
            <span>Phase 1 MVP 驗證版</span>
            <span aria-hidden="true">·</span>
            <span>拍照 ≤10s / 審核 ≤3s / 結構化雲端歸檔</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSpecModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              產品規劃說明書
            </button>
            <span aria-hidden="true">·</span>
            <span>狀態驅動型微溝通工具</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}
