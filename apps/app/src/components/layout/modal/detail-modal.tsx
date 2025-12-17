"use client";

import { X } from "@phosphor-icons/react";
import { Button } from "@spots/design/components/ui/button";
import { cn } from "@spots/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface DetailModalProps {
  isOpen: boolean;
  title: string;
  sections: {
    label: string;
    content: any;
    maxHeight?: string;
  }[];
  onClose: () => void;
}

export function DetailModal({
  isOpen,
  title,
  sections,
  onClose,
}: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    onClose();
  };

  // Format JSON for display
  const formatContent = (data: any) => {
    if (typeof data === "object") {
      try {
        return JSON.stringify(data, null, 2);
      } catch (error) {
        return String(data);
      }
    }
    return String(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop with blur */}
          <motion.div
            animate={{ opacity: 1 }}
            aria-hidden="true"
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={handleBackdropClick}
            transition={{ duration: 0.2 }}
          />

          {/* Modal dialog */}
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-md transform"
            exit={{ scale: 0.95, opacity: 0 }}
            initial={{ scale: 0.95, opacity: 0 }}
            ref={modalRef}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col overflow-hidden rounded-lg border border-border/50 bg-background shadow-lg">
              {/* Header with close button */}
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">{title}</h3>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent/50"
                  onClick={onClose}
                >
                  <X
                    className="h-4 w-4 text-muted-foreground"
                    weight="duotone"
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={index}>
                      <h4 className="mb-1 text-muted-foreground text-xs">
                        {section.label}
                      </h4>
                      <pre
                        className={cn(
                          "overflow-auto rounded bg-accent/20 p-2 font-mono text-foreground text-sm",
                          section.maxHeight
                            ? `max-h-[${section.maxHeight}]`
                            : "max-h-[150px]"
                        )}
                      >
                        {formatContent(section.content)}
                      </pre>
                    </div>
                  ))}
                </div>

                {/* Button row */}
                <div className="mt-6 flex justify-end">
                  <Button
                    className="text-xs"
                    onClick={onClose}
                    size="sm"
                    type="button"
                    variant="default"
                  >
                    close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
