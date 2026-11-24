import React from 'react';
import { X, Check, Target, Users, Zap, Shield, ArrowRight } from 'lucide-react';

interface MvpSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MvpSpecModal: React.FC<MvpSpecModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold mb-1">
              <span>PHASE 1 : MVP</span>
              <span>·</span>
              <span>產品規劃說明書</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Micro-Sync 專案微同步
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Core Hypotheses */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            一、 核心驗證假說 (Validation Hypotheses)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-mono text-indigo-600 font-semibold block mb-1">
                指標 01
              </span>
              <p className="text-xs font-bold text-slate-900 mb-1">學生回報 &lt; 10 秒</p>
              <p className="text-[11px] text-slate-500">
                相機即首頁 + 30 字上限 + 單選標籤，杜絕客套長文與拖延。
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-mono text-emerald-600 font-semibold block mb-1">
                指標 02
              </span>
              <p className="text-xs font-bold text-slate-900 mb-1">教授審核 &lt; 3 秒</p>
              <p className="text-[11px] text-slate-500">
                免裝 App、私密 Web 連結，手機瀏覽器一鍵「核准」或「微調」。
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-mono text-amber-600 font-semibold block mb-1">
                指標 03
              </span>
              <p className="text-xs font-bold text-slate-900 mb-1">雲端時間軸自動歸檔</p>
              <p className="text-[11px] text-slate-500">
                成果自動結構化入庫，徹底解決通訊軟體檔案 14 天過期之痛。
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Roles */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            二、 目標使用者與關鍵痛點
          </h3>
          <div className="space-y-2">
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="text-xs font-bold text-slate-900 mb-0.5">
                學生端（回報者）：大四專題生／碩一研究生
              </div>
              <p className="text-xs text-slate-600">
                痛點：怕客套措辭、怕組織長篇大論而拖延回報。解法：一鍵拍照 + 微文字 (≤30字)。
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="text-xs font-bold text-slate-900 mb-0.5">
                教授端（審核者）：指導教授／實驗室主持人
              </div>
              <p className="text-xs text-slate-600">
                痛點：被多組零碎訊息轟炸、抗拒安裝非必要軟體。解法：免裝 App、私密 Web 連結 3 秒審核。
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: State Machine */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-600" />
            三、 狀態流轉機 (State Machine)
          </h3>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-600 w-28">[Draft]</span>
              <span className="text-slate-500">學生相機取景、填寫微文字編輯中</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-600 w-28">[Pending Review]</span>
              <span className="text-slate-500">已送出，觸發 LINE Notify 私密連結通知</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-600 w-28">[Changes Requested]</span>
              <span className="text-slate-500">退回草稿，學生需針對單行備註重新上傳</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-600 w-28">[Approved]</span>
              <span className="text-slate-500">審核通過，進度條自動推進至下一階段</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          關閉說明
        </button>
      </div>
    </div>
  );
};
