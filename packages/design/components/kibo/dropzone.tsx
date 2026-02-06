"use client";

import { Icon, type IconName, IconNames } from "@repo/design/icons";
import * as React from "react";
import { type DropzoneOptions, useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface DropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
	onDrop?: (files: File[]) => void;
	className?: string;
	label?: string;
	description?: string;
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function getFileIconName(type: string): IconName {
	if (type.startsWith("image/")) return IconNames.Image;
	if (type.startsWith("text/")) return IconNames.FileText;
	return IconNames.File;
}

export function Dropzone({
	onDrop,
	className,
	label = "Upload files",
	description = "Drag and drop or click to upload",
	accept,
	maxSize,
	maxFiles,
	...props
}: DropzoneProps) {
	const [files, setFiles] = React.useState<File[]>([]);

	const { getRootProps, getInputProps, isDragActive, isDragReject } =
		useDropzone({
			onDrop: (acceptedFiles) => {
				setFiles((prev) => [...prev, ...acceptedFiles]);
				onDrop?.(acceptedFiles);
			},
			accept,
			maxSize,
			maxFiles,
			...props,
		});

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const acceptStr = React.useMemo(() => {
		if (!accept) return "";
		return Object.keys(accept).join(", ");
	}, [accept]);

	const sizeStr = React.useMemo(() => {
		if (!maxSize) return "";
		return `less than ${formatFileSize(maxSize)}`;
	}, [maxSize]);

	return (
		<div className={cn("space-y-4", className)}>
			<div
				{...getRootProps()}
				className={cn(
					"relative overflow-hidden rounded-lg border-2 border-dashed p-8",
					"transition-colors cursor-pointer",
					"hover:border-primary/50 hover:bg-accent/50",
					isDragActive && "border-primary bg-accent",
					isDragReject && "border-destructive bg-destructive/10",
					"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				)}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center justify-center space-y-3 text-center">
					<div className="p-3 bg-primary/10 rounded-full">
						<Icon name={IconNames.Upload} className="h-6 w-6 text-primary" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium">{label}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
					{(acceptStr || sizeStr) && (
						<p className="text-xs text-muted-foreground">
							Accepts {acceptStr} {acceptStr && sizeStr && "files"} {sizeStr}
							{maxFiles && `. Max ${maxFiles} file${maxFiles > 1 ? "s" : ""}.`}
						</p>
					)}
				</div>
			</div>

			{files.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium">Uploaded files</p>
					<div className="space-y-2">
						{files.map((file, fileIndex) => {
							const iconName = getFileIconName(file.type);
							return (
								<div
									key={`${file.name}-${file.lastModified}-${file.size}`}
									className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
								>
									<div className="flex items-center space-x-3">
										<Icon
											name={iconName}
											className="h-4 w-4 text-muted-foreground"
										/>
										<div>
											<p className="text-sm font-medium truncate max-w-[200px]">
												{file.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatFileSize(file.size)}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => removeFile(fileIndex)}
									>
										<Icon name={IconNames.X} className="h-4 w-4" />
									</Button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
