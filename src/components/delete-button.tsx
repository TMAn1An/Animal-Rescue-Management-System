"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

/** Submit button that asks for confirmation before deleting. */
export function DeleteButton({ label, confirm }: { label: string; confirm: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit" className="btn btn-danger btn-sm" disabled={pending}
      onClick={(e) => { if (!window.confirm(confirm)) e.preventDefault(); }}
    >
      <Trash2 size={15} aria-hidden />{label}
    </button>
  );
}
