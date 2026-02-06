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
    case "plus":
      return (
        <Svg className={className}>
          <path d="M12 5v14M5 12h14" />
        </Svg>
      );
    case "star":
      return (
        <Svg className={className}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
    case "lock":
      return (
        <Svg className={className}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );
    case "pencil":
      return (
        <Svg className={className}>
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </Svg>
      );
    case "copy":
      return (
        <Svg className={className}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </Svg>
      );
    case "globe":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
      );
    case "database":
      return (
        <Svg className={className}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
          <path d="M3 12a9 3 0 0 0 18 0" />
        </Svg>
      );
    case "download":
      return (
        <Svg className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5M12 15V3" />
        </Svg>
      );
    case "eye":
      return (
        <Svg className={className}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case "trash":
      return (
        <Svg className={className}>
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M10 11v6M14 11v6" />
        </Svg>
      );
    case "code":
      return (
        <Svg className={className}>
          <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
        </Svg>
      );
    case "magnifying-glass":
      return (
        <Svg className={className}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </Svg>
      );
    case "sun":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </Svg>
      );
    case "moon":
      return (
        <Svg className={className}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      );
    default:
      return null;
  }
}
