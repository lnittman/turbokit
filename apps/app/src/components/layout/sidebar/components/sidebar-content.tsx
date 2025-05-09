"use client";

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { sidebarOpenAtom } from '@/atoms/layout';

export function SidebarContent() {
  const [isOpen] = useAtom(sidebarOpenAtom);
  
  return (
    <div className="flex-1 overflow-hidden hover:overflow-y-auto" style={{ width: 276 }}>
      <div className="py-2 h-full">
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
          transition={{ duration: 0.2 }}
          className="h-full"
          style={{ width: '100%' }}
        >
          {/* Add content here */}
        </motion.div>
      </div>
    </div>
  );
} 