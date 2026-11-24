import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Clock, ExternalLink, ZoomIn, CheckCircle, Share2, Copy } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ProjectCard } from '../types';

export const ProfessorReviewView: React.FC = () => {
  const { cards, project, activeReviewToken, reviewCard, setRole } = useProject();

  // Find target card to review:
  // 1. If activeReviewToken is set, find that specific card
  // 2. Otherwise find the first 'Pending Review' card
  // 3. Fallback to latest card
  const targetCard: ProjectCard | undefined =
    cards.find((c) => c.reviewToken === activeReviewToken) ||
    cards.find((c) => c.status === 'Pending Review') ||
    cards[0];

  // 3-Second Hypothesis Timer
  const [reviewSeconds, setReviewSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Changes requested modal & single-line note
  const [showChangesModal, setShowChangesModal] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isReviewedSuccess, setIsReviewedSuccess] = useState<boolean>(false);
  const [lastDecision, setLastDecision] = useState<'Approve' | 'Changes Requested' | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick feedback suggestions for professors to save typing
  const SUGGESTED_COMMENTS = [
    '架構圖未標示錯誤處理機制，請補正後再送。',
    '測試數據樣本量不足，請補齊 30 組以上實驗數據。',
    '請附上示波器訊號波形圖以確認去耦效果。',
    '推論速度達標，請繼續進行第 2 階段硬體整合。',
    '文獻探討格式正確，請接續完成第 3 章系統規格。',
  ];

  // Timer counter
  useEffect(() => {
    if (targetCard && targetCard.status === 'Pending Review' && !isReviewedSuccess) {
      setReviewSeconds(0);
      const start = Date.now();
      timerRef.current = window.setInterval(() => {
        setReviewSeconds(Math.round((Date.now() - start) / 100) / 10);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetCard, isReviewedSuccess]);

  if (!targetCard) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200">
        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">目前無待審核卡片</h3>
        <p className="text-xs text-slate-500 mb-4">所有專案進度均已處理完畢。</p>
        <button
          type="button"
          onClick={() => setRole('student')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          切換回學生端回報
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    const elapsed = reviewSeconds || 1.9;
    reviewCard(
      targetCard.id,
      'Approve',
      '審核通過，進度良好，准予推進至下一階段。',
      elapsed
    );
    setLastDecision('Approve');
    setIsReviewedSuccess(true);
  };

  const handleConfirmChanges = () => {
    const elapsed = reviewSeconds || 2.4;
    reviewCard(
      targetCard.id,
      'Changes Requested',
      feedbackComment.trim() || '需針對細節補充後重新回報。',
      elapsed
    );
    setShowChangesModal(false);
    setLastDecision('Changes Requested');
    setIsReviewedSuccess(true);
  };

  const copyPrivateLink = () => {
    const magicUrl = `${window.location.origin}?token=${targetCard.reviewToken}&role=professor`;
    navigator.clipboard?.writeText(magicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isAlreadyReviewed = targetCard.status === 'Approved' || targetCard.status === 'Changes Requested';

  return (
    <div className="w-full max-w-lg mx-auto pb-16">
      {/* Top Banner: Verification Hypothesis indicator */}
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">教授專屬免安裝 Web 反饋卡</span>
          <span>·</span>
          <span>零登入門檻</span>
        </div>

        {targetCard.status === 'Pending Review' && !isReviewedSuccess && (
          <div className="flex items-center gap-1 font-mono text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Clock className="w-3 h-3" />
            <span>決策計時: {reviewSeconds.toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Strip with Team & Project context */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span className="font-semibold text-indigo-700">{project.teamName}</span>
              <span>·</span>
              <span>第 {targetCard.phase} 階段回報</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={copyPrivateLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            title="複製私密審核連結"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? '已複製' : '分享連結'}</span>
          </button>
        </div>

        {/* Card Content & Media */}
        <div className="p-4 sm:p-5">
          {/* Photo with Click-to-Zoom */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] mb-4 group cursor-pointer border border-slate-100">
            <img
              src={targetCard.imageUrl}
              alt="學生提交進度"
              onClick={() => setImageModalOpen(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1 transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              點擊放大
            </button>

            {/* Tag Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-md font-medium">
              {targetCard.tag}
            </div>
          </div>

          {/* Student Micro-text (Focus of the 3-second glance) */}
          <div className="mb-5 bg-slate-50/90 rounded-2xl p-4 border border-slate-100">
            <span className="text-[11px] text-slate-400 block mb-1">學生微文字摘要 (≤30字)</span>
            <p className="text-base font-semibold text-slate-900 leading-snug">
              「{targetCard.text}」
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>提報時間：{new Date(targetCard.createdAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>學生填報耗時：{targetCard.submissionDurationSeconds?.toFixed(1) || '7.2'}s</span>
            </div>
          </div>

          {/* Decision States */}
          {isReviewedSuccess || isAlreadyReviewed ? (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center animate-fade-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-emerald-50 text-emerald-700">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {targetCard.status === 'Approved' || lastDecision === 'Approve'
                    ? '已核准通過 · 專案階段已解鎖'
                    : '已退回微調 · 學生端已收到意見'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                審核評語：{targetCard.review?.comment || feedbackComment || '進度良好，准予推進'}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                決策耗時：{targetCard.review?.reviewDurationSeconds?.toFixed(1) || reviewSeconds.toFixed(1)} 秒 (達成 3 秒內極速反饋)
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setRole('timeline')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  查看專案完整時間軸資產
                </button>
              </div>
            </div>
          ) : (
            /* 1-Click Decision Action Bar (3-second target) */
            <div className="space-y-2.5">
              <div className="text-center text-xs text-slate-400 mb-1">
                免打字客套 · 3 秒快速決策
              </div>

              {/* Primary Green Approve Button */}
              <button
                type="button"
                onClick={handleApprove}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all min-h-[52px]"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>【核准通過 ➔ 解鎖下一階段】</span>
              </button>

              {/* Secondary Amber Changes Requested Button */}
              <button
                type="button"
                onClick={() => setShowChangesModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[48px]"
              >
                <X className="w-4 h-4 text-amber-600 stroke-[2.5]" />
                <span>【需微調 ➔ 退回草稿】(附單行備註)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Changes Requested Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">填寫單行退回備註</h3>
              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              請給予具體指引，學生端將直接依據此備註重拍並修正：
            </p>

            {/* Quick Suggestions */}
            <div className="mb-3 space-y-1.5">
              <span className="text-[11px] text-slate-400 block">常用一鍵建議：</span>
              {SUGGESTED_COMMENTS.slice(0, 3).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFeedbackComment(s)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors block border border-slate-100"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <input
              type="text"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="單行評語（例：請補齊訊號波形圖）"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmChanges}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                確定退回草稿
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={targetCard.imageUrl}
              alt="進度照片細節"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 text-center text-white/90 text-xs">
              <span className="font-semibold">{targetCard.tag}</span> · {targetCard.text}
            </div>
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-medium backdrop-blur-md"
            >
              關閉預覽
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
