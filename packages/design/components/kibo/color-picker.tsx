"use client";

import * as React from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ColorPickerProps {
	value?: string;
	onChange?: (color: string) => void;
	className?: string;
	disabled?: boolean;
}

export function ColorPicker({
	value = "#000000",
	onChange,
	className,
	disabled = false,
}: ColorPickerProps) {
	const [color, setColor] = React.useState(value);
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		setColor(value);
	}, [value]);

	const handleChange = (newColor: string) => {
		setColor(newColor);
		onChange?.(newColor);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!color && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<div className="flex items-center gap-2 w-full">
						<div
							className="h-4 w-4 rounded border border-border"
							style={{ backgroundColor: color }}
						/>
						<span className="flex-1 truncate">{color}</span>
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3" align="start">
				<div className="space-y-3">
					<HexColorPicker color={color} onChange={handleChange} />
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">HEX</span>
						<Input
							value={color}
							onChange={(e) => handleChange(e.target.value)}
							className="h-8"
						/>
					</div>
					<div className="grid grid-cols-7 gap-1">
						{[
							"#000000",
							"#ffffff",
							"#ff0000",
							"#00ff00",
							"#0000ff",
							"#ffff00",
							"#ff00ff",
							"#00ffff",
							"#808080",
							"#800000",
							"#008000",
							"#000080",
							"#808000",
							"#800080",
						].map((presetColor) => (
							<button
								type="button"
								key={presetColor}
								className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
								style={{ backgroundColor: presetColor }}
								onClick={() => handleChange(presetColor)}
							/>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
