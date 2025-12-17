"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";

import { sidebarOpenAtom } from "@/atoms/layout";

export function SidebarContent(): React.ReactElement {
  const [isOpen] = useAtom(sidebarOpenAtom);

  return (
    <div
      className="flex-1 overflow-hidden hover:overflow-y-auto"
      style={{ width: 276 }}
    >
      <div className="h-full py-2">
        <motion.div
          animate={{
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          className="h-full"
          initial={false}
          style={{ width: "100%" }}
          transition={{ duration: 0.2 }}
        >
          {/* Add content here */}
        </motion.div>
      </div>
    </div>
  );
}
