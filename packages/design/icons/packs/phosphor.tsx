"use client";

import React from "react";
import {
  X as PhX,
  Check as PhCheck,
  Circle as PhCircle,
  CaretLeft as PhCaretLeft,
  CaretRight as PhCaretRight,
  CaretDown as PhCaretDown,
  CaretUp as PhCaretUp,
  Sidebar as PhSidebar,
  DotsSixVertical as PhDotsSixVertical,
  MagnifyingGlass as PhSearch,
  DotsThree as PhDotsThree,
  Minus as PhMinus,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  CaretRight as PhCaretRight2,
  Bell as PhBell,
  User as PhUser,
  GearSix as PhSettings,
  FileText as PhFileText,
  GithubLogo as PhGithub,
  TwitterLogo as PhTwitter,
  Sparkle as PhSparkles,
  Lightning as PhZap,
  Code as PhCode,
  Users as PhUsers,
  UsersThree as PhUsersThree,
  Globe as PhGlobe,
  Database as PhDatabase,
  FlowArrow as PhWorkflow,
  Robot as PhBot,
  CheckCircle as PhCheckCircle,
  Package as PhPackage,
  Book as PhBook,
  UploadSimple as PhUpload,
  Image as PhImage,
  File as PhFile,
} from "@phosphor-icons/react";
import type { IconWeight } from "../context";
import type { IconName } from "../names";

export function PhosphorIcon({ name, className, weight = "duotone" }: { name: IconName; className?: string; weight?: IconWeight }) {
  const common = { className, weight } as any;
  switch (name) {
    case "x":
      return <PhX {...common} />;
    case "check":
      return <PhCheck {...common} />;
    case "circle":
      return <PhCircle {...common} />;
    case "chevron-left":
      return <PhCaretLeft {...common} />;
    case "chevron-right":
      return <PhCaretRight {...common} />;
    case "chevron-down":
      return <PhCaretDown {...common} />;
    case "chevron-up":
      return <PhCaretUp {...common} />;
    case "panel-left":
      return <PhSidebar {...common} />;
    case "grip-vertical":
      return <PhDotsSixVertical {...common} />;
    case "search":
      return <PhSearch {...common} />;
    case "more-horizontal":
      return <PhDotsThree {...common} />;
    case "minus":
      return <PhMinus {...common} />;
    case "arrow-left":
      return <PhArrowLeft {...common} />;
    case "arrow-right":
      return <PhArrowRight {...common} />;
    case "caret-right":
      return <PhCaretRight2 {...common} />;
    case "bell":
      return <PhBell {...common} />;
    case "user":
      return <PhUser {...common} />;
    case "settings":
      return <PhSettings {...common} />;
    case "file-text":
      return <PhFileText {...common} />;
    case "github":
      return <PhGithub {...common} />;
    case "twitter":
      return <PhTwitter {...common} />;
    case "sparkles":
      return <PhSparkles {...common} />;
    case "zap":
      return <PhZap {...common} />;
    case "code":
      return <PhCode {...common} />;
    case "users":
      return (PhUsers ? <PhUsers {...common} /> : <PhUsersThree {...common} />);
    case "globe":
      return <PhGlobe {...common} />;
    case "database":
      return <PhDatabase {...common} />;
    case "workflow":
      return <PhWorkflow {...common} />;
    case "bot":
      return <PhBot {...common} />;
    case "check-circle":
      return <PhCheckCircle {...common} />;
    case "package":
      return <PhPackage {...common} />;
    case "book":
      return <PhBook {...common} />;
    case "upload":
      return <PhUpload {...common} />;
    case "image":
      return <PhImage {...common} />;
    case "file":
      return <PhFile {...common} />;
    default:
      return null;
  }
}
