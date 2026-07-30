"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";

interface PendingInvitesBannerProps {
  count: number;
}

export function PendingInvitesBanner({ count }: PendingInvitesBannerProps) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-info/30 bg-info/5 px-5 py-3.5 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/15 border border-info/25">
          <Mail className="h-4 w-4 text-info" />
        </div>
        <p className="text-sm text-foreground">
          You have{" "}
          <span className="font-semibold text-info">
            {count} pending invite{count !== 1 ? "s" : ""}
          </span>{" "}
          waiting for your response.
        </p>
      </div>
      <Link
        id="view-invites-link"
        href="/invites"
        className="shrink-0 rounded-full border border-info/40 bg-info/10 px-3.5 py-1.5 text-xs font-semibold text-info hover:bg-info/20 transition-colors"
      >
        View Invites
      </Link>
    </motion.div>
  );
}
