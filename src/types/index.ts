export type CategoryType =
  | "IAM & Auth"
  | "Frontend Architecture"
  | "Backend & BFF"
  | "Security & Defense";

export interface CodeSnippet {
  id: string;
  title: string;
  filename: string;
  language: string;
  code: string;
  description: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  subLabel: string;
  type: "client" | "gateway" | "server" | "auth" | "database";
  icon: string;
  x?: number;
  y?: number;
  trustZone?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  type: "request" | "response" | "event" | "internal" | "error";
  trustBoundary?: string;
}

export interface FlowStep {
  step: number;
  title: string;
  actor: string;
  target: string;
  protocol: string;
  action: string;
  description: string;
  payloadExample?: string;
  securityNote?: string;
  activeNodes: string[];
  activeEdgeIds?: string[];
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  koreanTitle: string;
  category: CategoryType;
  summary: string;
  overview: string;
  badges: string[];
  readingTimeMinutes: number;
  diagramNodes: DiagramNode[];
  diagramEdges?: DiagramEdge[];
  lockVersion?: number;
  flowSteps: FlowStep[];
  keyTakeaways: string[];
  tradeOffs: {
    pros: string[];
    cons: string[];
  };
  codeSnippets: CodeSnippet[];
  securityChecklistIds: string[];
  relatedTermIds: string[];
  relatedTopicIds: string[];
}

export interface ComparisonDimensionValue {
  text: string;
  status: "positive" | "warning" | "negative" | "neutral";
  detail?: string;
}

export interface ComparisonDimension {
  key: string;
  name: string;
  description?: string;
  values: Record<string, ComparisonDimensionValue>;
}

export interface ComparisonSubject {
  id: string;
  name: string;
  tag: string;
  iconName: string;
  recommendedFor: string;
  description: string;
}

export interface DecisionGuideRule {
  condition: string;
  recommendation: string;
  reason: string;
}

export interface ComparisonMatrix {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  subjects: ComparisonSubject[];
  dimensions: ComparisonDimension[];
  decisionGuide: DecisionGuideRule[];
}

export interface ChecklistItem {
  id: string;
  category:
    | "XSS Defense"
    | "CSRF Defense"
    | "OIDC & Token"
    | "BFF & Session"
    | "Infra & IAM";
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  verificationMethod: string;
  codeExample?: string;
  relatedTermIds?: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  koreanName: string;
  category:
    | "Protocol & Spec"
    | "Security Attack & Defense"
    | "Architecture Pattern"
    | "Identity & Cryptography";
  shortDef: string;
  fullDef: string;
  keyPoints: string[];
  specRef?: string;
  securityRelevance: string;
  tags: string[];
  relatedTopicIds?: string[];
}

export interface UserLearningState {
  bookmarks: string[];
  completedTopics: string[];
  notes: Record<string, string>;
  checklistProgress: Record<string, boolean>;
}
