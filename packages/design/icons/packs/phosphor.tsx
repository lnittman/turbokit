"use client";

import {
	ArrowLeft as PhArrowLeft,
	ArrowRight as PhArrowRight,
	Bell as PhBell,
	Book as PhBook,
	Robot as PhBot,
	CaretDown as PhCaretDown,
	CaretLeft as PhCaretLeft,
	CaretRight as PhCaretRight,
	CaretRight as PhCaretRight2,
	CaretUp as PhCaretUp,
	Check as PhCheck,
	CheckCircle as PhCheckCircle,
	Circle as PhCircle,
	Code as PhCode,
	Copy as PhCopy,
	Database as PhDatabase,
	DotsSixVertical as PhDotsSixVertical,
	DotsThree as PhDotsThree,
	DownloadSimple as PhDownload,
	Eye as PhEye,
	File as PhFile,
	FileText as PhFileText,
	GithubLogo as PhGithub,
	Globe as PhGlobe,
	Image as PhImage,
	Lock as PhLock,
	MagnifyingGlass as PhMagnifyingGlass,
	Minus as PhMinus,
	Moon as PhMoon,
	Package as PhPackage,
	Palette as PhPalette,
	PencilSimple as PhPencil,
	Plus as PhPlus,
	MagnifyingGlass as PhSearch,
	GearSix as PhSettings,
	Sidebar as PhSidebar,
	Sparkle as PhSparkles,
	Star as PhStar,
	Sun as PhSun,
	Trash as PhTrash,
	TwitterLogo as PhTwitter,
	UploadSimple as PhUpload,
	User as PhUser,
	Users as PhUsers,
	UsersThree as PhUsersThree,
	FlowArrow as PhWorkflow,
	X as PhX,
	Lightning as PhZap,
} from "@phosphor-icons/react";
import type { IconWeight } from "../context";
import type { IconName } from "../names";

export function PhosphorIcon({
	name,
	className,
	weight = "duotone",
}: {
	name: IconName;
	className?: string;
	weight?: IconWeight;
}) {
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
			return PhUsers ? <PhUsers {...common} /> : <PhUsersThree {...common} />;
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
		case "download":
			return <PhDownload {...common} />;
		case "image":
			return <PhImage {...common} />;
		case "file":
			return <PhFile {...common} />;
		case "trash":
			return <PhTrash {...common} />;
		case "eye":
			return <PhEye {...common} />;
		case "palette":
			return <PhPalette {...common} />;
		case "magnifying-glass":
			return <PhMagnifyingGlass {...common} />;
		case "plus":
			return <PhPlus {...common} />;
		case "star":
			return <PhStar {...common} />;
		case "lock":
			return <PhLock {...common} />;
		case "pencil":
			return <PhPencil {...common} />;
		case "copy":
			return <PhCopy {...common} />;
		case "sun":
			return <PhSun {...common} />;
		case "moon":
			return <PhMoon {...common} />;
		default:
			return null;
	}
}
