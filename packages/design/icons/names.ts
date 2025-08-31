export const IconNames = {
  X: "x",
  Check: "check",
  Circle: "circle",
  ChevronLeft: "chevron-left",
  ChevronRight: "chevron-right",
  ChevronDown: "chevron-down",
  ChevronUp: "chevron-up",
  PanelLeft: "panel-left",
  GripVertical: "grip-vertical",
  Search: "search",
  MoreHorizontal: "more-horizontal",
  Minus: "minus",
  ArrowLeft: "arrow-left",
  ArrowRight: "arrow-right",
  CaretRight: "caret-right",
  Bell: "bell",
  User: "user",
  Settings: "settings",
  FileText: "file-text",
} as const;

export type IconName = typeof IconNames[keyof typeof IconNames];

