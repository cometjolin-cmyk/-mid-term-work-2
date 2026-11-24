import React, { useState } from 'react';
import { ProjectCard, CardTag, CardStatus, ProjectPhase } from '../types';
import { useProject } from '../context/ProjectContext';
import { ZoomIn, Download, Filter, CheckCircle2, AlertCircle, Clock, FileText, ChevronRight } from 'lucide-react';

export const TimelineArchiveView: React.FC = () => {
  const { cards, project, setRole, setActiveReviewToken } = useProject();

  const [tagFilter, setTagFilter] = useState<CardTag | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<ProjectCard | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Filter cards
  const filteredCards = cards.filter((c) => {
    if (tagFilter !== 'all' && c.tag !== tagFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (phaseFilter !== 'all' && c.phase !== phaseFilter) return false;
    return true;
  });

  // Export report generator
  const generateMarkdownReport = () => {
    let md = `# ${project.title} - 專案里程碑與微同步進度報告\n`;
    md += `組別：${project.teamName} | 指導教授：${project.professorName}\n`;
    md += `實驗室：${project.laboratory}\n`;
    md += `生成日期：${new Date().toLocaleDateString('zh-TW')}\n\n`;
    md += `## 歷次結構化進度存檔\n\n`;

    cards.forEach((c, idx) => {
      md += `### ${idx + 1}. [階段 0${c.phase}] ${c.tag} - 狀態: ${c.status}\n`;
      md += `- **提報時間**：${new Date(c.createdAt).toLocaleString('zh-TW')}\n`;
      md += `- **學生回報 (≤30字)**：${c.text}\n`;
      if (c.submissionDurationSeconds) {
        md += `- **學生填報耗時**：${c.submissionDurationSeconds.toFixed(1)} 秒\n`;
      }
      if (c.review) {
        md += `- **教授決策**：${c.review.decision === 'Approve' ? '核准通過' : '需微調退回'}\n`;
        md += `- **教授評語**：${c.review.comment}\n`;
        md += `- **審核耗時**：${c.review.reviewDurationSeconds?.toFixed(1) || '2.0'} 秒\n`;
      }
      md += `\n`;
    });

    return md;
  };

  const handleDownloadReport = () => {
    const content = generateMarkdownReport();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.teamName}_進度存檔報告_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      {/* Header zone with stats & export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-700">{project.teamName}</span>
            <span>·</span>
            <span>{project.laboratory}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            專案時間軸雲端自動存檔
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            結構化保留每次拍照成果與教授批註 · 徹底告別通訊軟體檔案過期
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>匯出進度報告</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Interactive buttons) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>篩選條件</span>
        </div>

        {/* Status filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">審核狀態:</span>
          {(['all', 'Approved', 'Pending Review', 'Changes Requested'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all'
                ? '全部狀態'
                : s === 'Approved'
                ? '已核准 (Approved)'
                : s === 'Pending Review'
                ? '審核中 (Pending)'
                : '需微調 (Changes)'}
            </button>
          ))}
        </div>

        {/* Tag filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">標籤分類:</span>
          {(['all', '#提案確認', '#卡關求助', '#階段成果'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTagFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tagFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? '全部標籤' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredCards.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">查無符合條件的進度卡片</p>
          <p className="text-xs text-slate-400 mt-1">請嘗試變更上方篩選條件或切換至學生端進行拍照回報。</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 ml-3 sm:ml-4">
          {filteredCards.map((card, index) => {
            const isApproved = card.status === 'Approved';
            const isChangesRequested = card.status === 'Changes Requested';
            const isPending = card.status === 'Pending Review';

            return (
              <div key={card.id} className="relative group">
                {/* Node marker on the line */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full border-4 border-slate-50 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isApproved
                      ? 'bg-emerald-600'
                      : isChangesRequested
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                />

                {/* Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Thumbnail slot */}
                    <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-100">
                      <img
                        src={card.imageUrl}
                        alt="進度照片"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedCard(card)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] backdrop-blur-md flex items-center gap-1"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        檢視
                      </button>
                    </div>

                    {/* Content details */}
                    <div className="md:col-span-8 flex flex-col justify-between h-full">
                      <div>
                        {/* Clean unboxed metadata with · separators */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-slate-800">{card.tag}</span>
                          <span aria-hidden="true">·</span>
                          <span>第 {card.phase} 階段</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">
                            {new Date(card.createdAt).toLocaleString('zh-TW', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              isApproved
                                ? 'text-emerald-700'
                                : isChangesRequested
                                ? 'text-amber-700'
                                : 'text-indigo-700'
                            }`}
                          >
                            {card.status}
                          </span>
                        </div>

                        {/* Student micro-text (≤30 chars) */}
                        <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
                          「{card.text}」
                        </h3>

                        {/* Professor review block if reviewed */}
                        {card.review ? (
                          <div
                            className={`p-3 rounded-2xl text-xs mb-3 border ${
                              isApproved
                                ? 'bg-emerald-50/70 border-emerald-100/80 text-slate-800'
                                : 'bg-amber-50/70 border-amber-100/80 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="flex items-center gap-1">
                                {isApproved ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                教授回饋 (耗時 {card.review.reviewDurationSeconds?.toFixed(1) || '2.0'}s)
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(card.review.reviewedAt).toLocaleTimeString('zh-TW', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="font-medium text-slate-900">
                              {card.review.comment}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl text-xs mb-3 bg-indigo-50/60 border border-indigo-100 text-indigo-900 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              等待教授審核中 (私密 Web 連結生效中)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReviewToken(card.reviewToken);
                                setRole('professor');
                              }}
                              className="text-xs font-semibold underline text-indigo-700 hover:text-indigo-900"
                            >
                              前往審核
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card footer metrics */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>回報耗時：{card.submissionDurationSeconds?.toFixed(1) || '7.0'} 秒</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCard(card)}
                          className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          查看完整卡片明細
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Card Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500 font-medium">
                {selectedCard.tag} · 第 {selectedCard.phase} 階段
              </div>
              <span
                className={`text-xs font-bold ${
                  selectedCard.status === 'Approved'
                    ? 'text-emerald-700'
                    : selectedCard.status === 'Changes Requested'
                    ? 'text-amber-700'
                    : 'text-indigo-700'
                }`}
              >
                {selectedCard.status}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 mb-4 border border-slate-100">
              <img
                src={selectedCard.imageUrl}
                alt="進度照片大圖"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mb-4">
              <span className="text-[11px] text-slate-400 block mb-1">學生回報摘要</span>
              <p className="text-base font-bold text-slate-900">「{selectedCard.text}」</p>
            </div>

            {selectedCard.review && (
              <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">指導教授評語</span>
                  <span className="font-mono">
                    審核耗時 {selectedCard.review.reviewDurationSeconds?.toFixed(1) || '2.1'}s
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedCard.review.comment}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">匯出專題微同步成果週報</h3>
                <p className="text-xs text-slate-500">
                  將本階段 {cards.length} 筆結構化回報自動生成為 Markdown 與書面存檔
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 max-h-60 overflow-y-auto mb-4 whitespace-pre-wrap">
              {generateMarkdownReport()}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadReport();
                  setShowExportModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                下載 .md 專案紀錄檔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
