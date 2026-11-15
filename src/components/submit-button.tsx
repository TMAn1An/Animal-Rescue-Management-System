"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import clsx from "clsx";

export function SubmitButton({
  children, pendingLabel, className = "btn btn-primary",
}: { children: React.ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={clsx(className)} disabled={pending} aria-busy={pending}>
      {pending && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
