"use client";

import React from "react";
import type { IconName } from "../names";

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.0} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

export function StreamlinePlumpIcon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case "x":
      return (
        <Svg className={className}>
          <path d="M18 6L6 18M6 6l12 12" />
        </Svg>
      );
    case "check":
      return (
        <Svg className={className}>
          <path d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case "circle":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
        </Svg>
      );
    case "chevron-left":
      return (
        <Svg className={className}>
          <path d="M15 18l-6-6 6-6" />
        </Svg>
      );
    case "chevron-right":
      return (
        <Svg className={className}>
          <path d="M9 6l6 6-6 6" />
        </Svg>
      );
    case "chevron-down":
      return (
        <Svg className={className}>
          <path d="M6 9l6 6 6-6" />
        </Svg>
      );
    case "chevron-up":
      return (
        <Svg className={className}>
          <path d="M18 15l-6-6-6 6" />
        </Svg>
      );
    case "panel-left":
      return (
        <Svg className={className}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </Svg>
      );
    case "grip-vertical":
      return (
        <Svg className={className}>
          <circle cx="9" cy="7" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="9" cy="17" r="1.5" />
          <circle cx="15" cy="7" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="15" cy="17" r="1.5" />
        </Svg>
      );
    case "search":
      return (
        <Svg className={className}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </Svg>
      );
    case "more-horizontal":
      return (
        <Svg className={className}>
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </Svg>
      );
    case "minus":
      return (
        <Svg className={className}>
          <path d="M5 12h14" />
        </Svg>
      );
    case "arrow-left":
      return (
        <Svg className={className}>
          <path d="M12 19l-7-7 7-7" />
          <path d="M19 12H6" />
        </Svg>
      );
    case "arrow-right":
      return (
        <Svg className={className}>
          <path d="M12 5l7 7-7 7" />
          <path d="M5 12h13" />
        </Svg>
      );
    case "caret-right":
      return (
        <Svg className={className}>
          <path d="M10 7l6 5-6 5V7z" />
        </Svg>
      );
    case "bell":
      return (
        <Svg className={className}>
          <path d="M15 17H9a4 4 0 0 1-4-4V9a7 7 0 0 1 14 0v4a4 4 0 0 1-4 4Z" />
          <path d="M10 21h4" />
        </Svg>
      );
    case "user":
      return (
        <Svg className={className}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 5-6 8-6s6.5 2.5 8 6" />
        </Svg>
      );
    case "settings":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </Svg>
      );
    case "file-text":
      return (
        <Svg className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </Svg>
      );
    default:
      return null;
  }
}
