import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectCard, CardTag, ViewRole, ProjectPhase } from '../types';
import { INITIAL_PROJECT, INITIAL_CARDS } from '../data/initialData';

interface NotificationState {
  id: string;
  cardId: string;
  reviewToken: string;
  sender: string;
  previewText: string;
  tag: CardTag;
  imageUrl: string;
  timestamp: string;
}

interface ProjectContextType {
  project: Project;
  cards: ProjectCard[];
  role: ViewRole;
  setRole: (role: ViewRole) => void;
  activeReviewToken: string | null;
  setActiveReviewToken: (token: string | null) => void;
  notification: NotificationState | null;
  dismissNotification: () => void;
  submitCard: (data: { imageUrl: string; text: string; tag: CardTag; durationSeconds: number }) => ProjectCard;
  reviewCard: (cardId: string, decision: 'Approve' | 'Changes Requested', comment: string, durationSeconds: number) => void;
  editDraftFromCard: (cardId: string) => ProjectCard | undefined;
  advanceProjectPhase: () => void;
  setProjectPhase: (phase: ProjectPhase) => void;
  resetDemoData: () => void;
  isDeviceFrame: boolean;
  setIsDeviceFrame: (val: boolean) => void;
  pendingCard: ProjectCard | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY_PROJECT = 'micro_sync_project_v1';
const STORAGE_KEY_CARDS = 'micro_sync_cards_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECT);
      return saved ? JSON.parse(saved) : INITIAL_PROJECT;
    } catch {
      return INITIAL_PROJECT;
    }
  });

  const [cards, setCards] = useState<ProjectCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [role, setRole] = useState<ViewRole>('student');
  const [activeReviewToken, setActiveReviewToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECT, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to save project', e);
    }
  }, [project]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch (e) {
      console.warn('Failed to save cards', e);
    }
  }, [cards]);

  // Audio effect helper (subtle tactile feedback using Web Audio API)
  const playSound = (type: 'snap' | 'approve' | 'reject' | 'notify') => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'snap') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'approve') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'notify') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'reject') {
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.setValueAtTime(280, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  const submitCard = (data: { imageUrl: string; text: string; tag: CardTag; durationSeconds: number }): ProjectCard => {
    const token = `rev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const newCard: ProjectCard = {
      id: `card_${Date.now()}`,
      projectId: project.id,
      phase: project.currentPhase,
      imageUrl: data.imageUrl,
      text: data.text.trim().slice(0, 30),
      tag: data.tag,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
      reviewToken: token,
      submissionDurationSeconds: data.durationSeconds,
    };

    setCards((prev) => [newCard, ...prev]);
    playSound('snap');

    // Trigger simulated LINE Push notification to Professor
    const notif: NotificationState = {
      id: `notif_${Date.now()}`,
      cardId: newCard.id,
      reviewToken: token,
      sender: `${project.teamName} · ${project.members[0]}`,
      previewText: newCard.text,
      tag: newCard.tag,
      imageUrl: newCard.imageUrl,
      timestamp: '剛剛',
    };
    setNotification(notif);
    playSound('notify');

    return newCard;
  };

  const reviewCard = (
    cardId: string,
    decision: 'Approve' | 'Changes Requested',
    comment: string,
    durationSeconds: number
  ) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            status: decision === 'Approve' ? 'Approved' : 'Changes Requested',
            review: {
              decision,
              comment: comment.trim(),
              reviewedAt: new Date().toISOString(),
              reviewDurationSeconds: durationSeconds,
            },
          };
        }
        return c;
      })
    );

    if (decision === 'Approve') {
      playSound('approve');
      // If approved and current phase is 1 or 2, automatically advance project phase
      setProject((p) => {
        if (p.currentPhase < 3) {
          return { ...p, currentPhase: (p.currentPhase + 1) as ProjectPhase };
        }
        return p;
      });
    } else {
      playSound('reject');
    }

    // Clear notification if related
    if (notification && notification.cardId === cardId) {
      setNotification(null);
    }
  };

  const editDraftFromCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    if (!target) return undefined;
    setRole('student');
    return target;
  };

  const advanceProjectPhase = () => {
    setProject((prev) => ({
      ...prev,
      currentPhase: Math.min(3, prev.currentPhase + 1) as ProjectPhase,
    }));
  };

  const setProjectPhase = (phase: ProjectPhase) => {
    setProject((prev) => ({ ...prev, currentPhase: phase }));
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const resetDemoData = () => {
    setProject(INITIAL_PROJECT);
    setCards(INITIAL_CARDS);
    setNotification(null);
    setActiveReviewToken(null);
    localStorage.removeItem(STORAGE_KEY_PROJECT);
    localStorage.removeItem(STORAGE_KEY_CARDS);
  };

  const pendingCard = cards.find((c) => c.status === 'Pending Review');

  return (
    <ProjectContext.Provider
      value={{
        project,
        cards,
        role,
        setRole,
        activeReviewToken,
        setActiveReviewToken,
        notification,
        dismissNotification,
        submitCard,
        reviewCard,
        editDraftFromCard,
        advanceProjectPhase,
        setProjectPhase,
        resetDemoData,
        isDeviceFrame,
        setIsDeviceFrame,
        pendingCard,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
