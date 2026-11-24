export type ProjectPhase = 1 | 2 | 3;

export type CardTag = '#提案確認' | '#卡關求助' | '#階段成果';

export type CardStatus = 'Draft' | 'Pending Review' | 'Changes Requested' | 'Approved';

export interface CardReview {
  decision: 'Approve' | 'Changes Requested';
  comment: string;
  reviewedAt: string;
  reviewDurationSeconds?: number;
}

export interface ProjectCard {
  id: string;
  projectId: string;
  phase: ProjectPhase;
  imageUrl: string;
  text: string; // strictly <= 30 characters
  tag: CardTag;
  status: CardStatus;
  createdAt: string;
  reviewToken: string;
  submissionDurationSeconds?: number;
  review?: CardReview;
}

export interface Project {
  id: string;
  title: string;
  teamName: string;
  members: string[];
  professorName: string;
  laboratory: string;
  currentPhase: ProjectPhase;
  phaseNames: [string, string, string];
  createdAt: string;
}

export type ViewRole = 'student' | 'professor' | 'timeline';
