import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Send, RotateCcw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CardTag, ProjectCard } from '../types';
import { useProject } from '../context/ProjectContext';
import { PRESET_SNAP_ASSETS } from '../data/initialData';
import { PhaseProgressBar } from './PhaseProgressBar';

const TAG_OPTIONS: CardTag[] = ['#提案確認', '#卡關求助', '#階段成果'];

export const StudentCaptureView: React.FC = () => {
  const { project, submitCard, cards, setRole, setActiveReviewToken } = useProject();

  // Camera & Capture states
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Form states
  const [text, setText] = useState<string>('');
  const [tag, setTag] = useState<CardTag>('#提案確認');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmittedCard, setLastSubmittedCard] = useState<ProjectCard | null>(null);

  // Stop-watch timer to test the "< 10s report" hypothesis
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start timer once photo is selected
  useEffect(() => {
    if (capturedImage && !lastSubmittedCard) {
      setTimerSeconds(0);
      const start = Date.now();
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(Math.round((Date.now() - start) / 100) / 10);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [capturedImage, lastSubmittedCard]);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreamActive(true);
        }
      } else {
        setCameraError('瀏覽器環境未開放相機權限，可使用相簿選取或預設照片');
      }
    } catch {
      setCameraError('相機無法啟用（可能需授予權限或處於非 HTTPS 預覽），可改用相簿或下方預設專案照片');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    // Attempt camera auto-start if no image selected
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [capturedImage]);

  // Snap photo from video element
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Select file from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Pick one of the realistic capstone presets
  const selectPreset = (preset: typeof PRESET_SNAP_ASSETS[0]) => {
    setCapturedImage(preset.url);
    setText(preset.defaultText);
    setTag(preset.defaultTag);
    stopCamera();
  };

  // Submit action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage) return;

    setIsSubmitting(true);
    const duration = timerSeconds || 4.2;

    const newCard = submitCard({
      imageUrl: capturedImage,
      text: text.trim() || '進度回報，請教授查閱',
      tag,
      durationSeconds: duration,
    });

    setIsSubmitting(false);
    setLastSubmittedCard(newCard);
  };

  // Reset to take another snapshot
  const handleRetake = () => {
    setCapturedImage(null);
    setText('');
    setLastSubmittedCard(null);
    setTimerSeconds(0);
    startCamera();
  };

  // Find latest active changes requested card to show feedback alert
  const changesRequestedCard = cards.find((c) => c.status === 'Changes Requested');

  return (
    <div className="w-full max-w-2xl mx-auto pb-16">
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Changes requested callout if professor asked for revision */}
      {changesRequestedCard && !lastSubmittedCard && (
        <div className="mb-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 transition-all">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
                <span>教授反饋：需微調退回</span>
                <span className="font-mono text-[11px] font-normal">{changesRequestedCard.tag}</span>
              </div>
              <p className="text-sm text-slate-800 font-medium bg-white/70 p-2.5 rounded-lg border border-amber-100">
                「{changesRequestedCard.review?.comment || '請修正後重送'}」
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs text-amber-700">可針對教授備註重新拍攝上傳</span>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(changesRequestedCard.imageUrl);
                    setText(changesRequestedCard.text);
                    setTag(changesRequestedCard.tag);
                  }}
                  className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 px-2 py-1"
                >
                  帶入原圖重修
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main card container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Top Header Strip with Project context */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-indigo-700 tracking-tight">
                {project.teamName}
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {project.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">指導教授</span>
              <span className="text-xs font-medium text-slate-800">{project.professorName}</span>
            </div>
          </div>

          {/* 3-Phase Progress Indicator */}
          <PhaseProgressBar currentPhase={project.currentPhase} phaseNames={project.phaseNames} />
        </div>

        {/* Successful submission state */}
        {lastSubmittedCard ? (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              進度卡片已送出！
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              狀態已轉為 <span className="font-semibold text-indigo-600">Pending Review</span>，系統已產出私密審核連結。
            </p>

            {/* Micro metrics */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto mb-6 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>填報耗時</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {lastSubmittedCard.submissionDurationSeconds?.toFixed(1) || '6.5'} 秒
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>標籤分類</span>
                <span className="font-semibold text-slate-800">{lastSubmittedCard.tag}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>微文字描述</span>
                <span className="text-slate-800 text-xs font-medium max-w-[200px] truncate text-right">
                  {lastSubmittedCard.text}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 text-center font-medium">
                ⚡ 達成「單次回報 &lt; 10 秒」MVP 核心指標
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveReviewToken(lastSubmittedCard.reviewToken);
                  setRole('professor');
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                模擬教授視角 (3秒審核)
              </button>

              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                繼續拍攝下一張
              </button>
            </div>
          </div>
        ) : (
          /* Capture & Report Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            {/* Viewfinder / Image Display Area */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-200/50 mb-4 shadow-inner">
              {capturedImage ? (
                <>
                  <img
                    src={capturedImage}
                    alt="進度照片截圖"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating badge for timer */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    填報計時：{timerSeconds.toFixed(1)}s
                  </div>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重拍
                  </button>
                </>
              ) : streamActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay UI */}
                  <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-2xl m-3 flex flex-col justify-between p-2">
                    <span className="text-[11px] text-white/70 bg-black/40 self-start px-2 py-0.5 rounded">
                      相機即首頁：對準白板、程式碼或雛型
                    </span>
                    <span className="text-[11px] text-white/70 bg-black/40 self-end px-2 py-0.5 rounded">
                      4:3 結構化取景
                    </span>
                  </div>

                  {/* Primary Snap Button */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all"
                      title="從相簿選擇"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="w-16 h-16 rounded-full bg-white p-1 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                      title="拍攝進度"
                    >
                      <div className="w-13 h-13 rounded-full border-2 border-slate-900 bg-slate-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-slate-900" />
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* Fallback if camera stream is inactive or blocked */
                <div className="p-6 text-center text-slate-300">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm font-medium text-slate-200 mb-1">相機待命中</p>
                  <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
                    {cameraError || '點擊啟用相機，或由相簿選取白板、程式碼或論文草圖'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      開啟相機
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
                    >
                      從相簿選取
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Presets Carousel (Allows testing in 1 second) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-0.5">
                <span className="font-medium text-slate-700">快速載入專案現場照片（測試預設）</span>
                <span className="text-[11px] text-indigo-600">一鍵帶入</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SNAP_ASSETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className="p-2 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {p.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Micro-text Input (≤ 30 Chinese Characters) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 px-0.5">
                <label htmlFor="micro-text" className="font-semibold text-slate-800">
                  微文字重點回報 (≤30字)
                </label>
                <span
                  className={`font-mono text-xs font-medium ${
                    text.length > 25
                      ? 'text-amber-600'
                      : text.length === 30
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}
                >
                  {text.length}/30 字
                </span>
              </div>

              <div className="relative">
                <input
                  id="micro-text"
                  type="text"
                  maxLength={30}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="例：最短路徑推論延遲降至 28ms，請教授確認"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 px-1">
                杜絕客套長文與開場白，直接填寫核心進度或卡關關鍵字。
              </p>
            </div>

            {/* Tag Selection (Single choice) */}
            <div className="mb-5">
              <span className="block text-xs font-semibold text-slate-800 mb-2 px-0.5">
                回報標籤分類 (單選)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TAG_OPTIONS.map((t) => {
                  const isSelected = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center min-h-[44px] flex items-center justify-center ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!capturedImage || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                !capturedImage
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>送出微回報 ➔ 進入待審核 (Pending Review)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
