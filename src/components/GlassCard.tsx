"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function GlassCard({ children, className = "", onClick, hover = true }: GlassCardProps) {
  const baseClasses = "glass-card rounded-2xl p-6 md:p-8";
  const combinedClasses = `${baseClasses} ${className} ${onClick ? "cursor-pointer" : ""}`;

  if (hover && onClick) {
    return (
      <motion.div
        className={combinedClasses}
        onClick={onClick}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={combinedClasses}>{children}</div>;
}

