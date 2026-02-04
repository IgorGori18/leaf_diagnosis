import React from "react";

interface ProgressBarProps {
  value: number; // 0-100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-800">
      <div
        className="h-2 rounded-full bg-leaf-400 transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        role="progressbar"
      />
    </div>
  );
};

