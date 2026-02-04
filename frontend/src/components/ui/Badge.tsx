import React from "react";
import type { HealthStatus } from "../../lib/types";

interface BadgeProps {
  status: HealthStatus;
}

const statusConfig: Record<
  HealthStatus,
  { label: string; className: string }
> = {
  healthy: {
    label: "Здоровое",
    className: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40"
  },
  warning: {
    label: "Требует внимания",
    className: "bg-amber-500/10 text-amber-300 ring-amber-500/40"
  },
  critical: {
    label: "Критическое",
    className: "bg-rose-500/10 text-rose-300 ring-rose-500/40"
  }
};

export const HealthBadge: React.FC<BadgeProps> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

