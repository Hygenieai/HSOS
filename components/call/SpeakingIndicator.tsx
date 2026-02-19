"use client";

export function SpeakingIndicator() {
  return (
    <div className="flex items-end gap-[2px] h-3">
      <div className="w-[3px] bg-[#00989E] rounded-full animate-speaking-1" />
      <div className="w-[3px] bg-[#00989E] rounded-full animate-speaking-2" />
      <div className="w-[3px] bg-[#00989E] rounded-full animate-speaking-3" />
    </div>
  );
}
