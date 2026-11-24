import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MessageSquare, ExternalLink, X, Clock } from 'lucide-react';

export const LineNotificationBanner: React.FC = () => {
  const { notification, dismissNotification, setRole, setActiveReviewToken } = useProject();

  if (!notification) return null;

  const handleOpenReview = () => {
    setActiveReviewToken(notification.reviewToken);
    setRole('professor');
    dismissNotification();
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce-in">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400">LINE Notify 模擬推播</span>
                <span className="text-[10px] text-slate-400 font-mono">剛剛</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">
                {notification.sender}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissNotification}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-2.5 flex items-center gap-3">
          <img
            src={notification.imageUrl}
            alt="預覽"
            className="w-12 h-12 object-cover rounded-lg shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-indigo-300 font-medium block">
              {notification.tag}
            </span>
            <p className="text-xs text-slate-200 truncate font-medium">
              「{notification.previewText}」
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleOpenReview}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            點此開啟 3秒免裝App審核卡
          </button>
          <button
            type="button"
            onClick={dismissNotification}
            className="py-2 px-3 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
          >
            忽略
          </button>
        </div>
      </div>
    </div>
  );
};
