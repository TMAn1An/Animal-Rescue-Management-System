import { AlarmClock, CircleCheck, CircleDashed, CircleX, UserCheck } from "lucide-react";
import type { Condition, Status } from "@/db/schema";
import type { Dict } from "@/i18n";

const STATUS_ICON = { pending: CircleDashed, assigned: UserCheck, completed: CircleCheck, cancelled: CircleX } as const;

export function StatusBadge({ status, t }: { status: Status; t: Dict }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`badge badge-${status}`}>
      <Icon size={13} aria-hidden /> {t.status[status]}
    </span>
  );
}

export function ConditionBadge({ condition, t }: { condition: Condition; t: Dict }) {
  return <span className={`badge badge-${condition}`}>{t.condition[condition]}</span>;
}

export function OverdueBadge({ label, title }: { label: string; title?: string }) {
  return (
    <span className="badge badge-serious" title={title}>
      <AlarmClock size={13} aria-hidden /> {label}
    </span>
  );
}
