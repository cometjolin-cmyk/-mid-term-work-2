import { Project, ProjectCard } from '../types';

export const INITIAL_PROJECT: Project = {
  id: 'proj-edge-vision-2026',
  title: '邊緣端 AI 導盲輔助視覺系統',
  teamName: '專題第 04 組',
  members: ['陳冠宇 (組長/演算法)', '林映辰 (硬體電路)', '黃柏凱 (雲端整合)'],
  professorName: '林哲生 講座教授',
  laboratory: '嵌入式智慧感知與機器人實驗室 (ESRL)',
  currentPhase: 2,
  phaseNames: ['1. 提案對焦', '2. 實作推進', '3. 交付結案'],
  createdAt: '2026-10-15T09:00:00Z',
};

export const PRESET_SNAP_ASSETS = [
  {
    id: 'preset-whiteboard',
    label: '白板系統架構草圖',
    subtitle: '資料流與各層模組切分',
    url: '/src/assets/images/whiteboard_arch_diagram_1793904544865.jpg',
    defaultText: '串流 Kafka 與 Spark 即時聚合模組切分完成，請確認',
    defaultTag: '#提案確認' as const,
  },
  {
    id: 'preset-code',
    label: '核心演算法程式碼',
    subtitle: '最短路徑與即時推論優化',
    url: '/src/assets/images/code_review_ide_1793904546044.jpg',
    defaultText: 'Dijkstra 佇列記憶體降 40%，FPS 達標 32fps',
    defaultTag: '#階段成果' as const,
  },
  {
    id: 'preset-hardware',
    label: '硬體感測電路雛型',
    subtitle: 'ESP32 與超音波訊號除錯',
    url: '/src/assets/images/hardware_lab_prototype_1793904546873.jpg',
    defaultText: 'I2C 通訊在多感測器並聯時偶發掉封包，卡關求助',
    defaultTag: '#卡關求助' as const,
  },
  {
    id: 'preset-paper',
    label: '論文方法論草稿與框線圖',
    subtitle: '系統架構圖與 API 介面規格',
    url: '/src/assets/images/paper_thesis_draft_1793904547230.jpg',
    defaultText: '文獻探討與 Chapter 3 架構草圖已繪製完成',
    defaultTag: '#提案確認' as const,
  },
];

export const INITIAL_CARDS: ProjectCard[] = [
  {
    id: 'card-001',
    projectId: 'proj-edge-vision-2026',
    phase: 1,
    imageUrl: '/src/assets/images/whiteboard_arch_diagram_1793904544865.jpg',
    text: '系統架構三層劃分完畢，已納入備援快取',
    tag: '#提案確認',
    status: 'Approved',
    createdAt: '2026-10-18T14:22:10Z',
    reviewToken: 'rev-token-001-mock',
    submissionDurationSeconds: 8.4,
    review: {
      decision: 'Approve',
      comment: '架構切分清晰，直接進入第二階段硬體採購與韌體撰寫。',
      reviewedAt: '2026-10-18T14:23:45Z',
      reviewDurationSeconds: 2.1,
    },
  },
  {
    id: 'card-002',
    projectId: 'proj-edge-vision-2026',
    phase: 2,
    imageUrl: '/src/assets/images/hardware_lab_prototype_1793904546873.jpg',
    text: '感測模組電源雜訊偏高，中斷觸發頻率異常',
    tag: '#卡關求助',
    status: 'Changes Requested',
    createdAt: '2026-10-25T11:05:30Z',
    reviewToken: 'rev-token-002-mock',
    submissionDurationSeconds: 7.2,
    review: {
      decision: 'Changes Requested',
      comment: '請在 VCC 與 GND 間並聯 100nF 去耦電容，量測示波器波形後重新回報。',
      reviewedAt: '2026-10-25T11:08:12Z',
      reviewDurationSeconds: 2.7,
    },
  },
  {
    id: 'card-003',
    projectId: 'proj-edge-vision-2026',
    phase: 2,
    imageUrl: '/src/assets/images/code_review_ide_1793904546044.jpg',
    text: '推論模型量化完成，單幀延遲降至 28ms',
    tag: '#階段成果',
    status: 'Pending Review',
    createdAt: '2026-11-05T09:15:00Z',
    reviewToken: 'rev-token-003-active',
    submissionDurationSeconds: 6.5,
  },
];
