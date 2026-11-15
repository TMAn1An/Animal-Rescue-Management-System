import { Bird, Cat, Dog, PawPrint } from "lucide-react";
import type { PetType } from "@/db/schema";

const ICONS = { dog: Dog, cat: Cat, bird: Bird, other: PawPrint } as const;

export function PetIcon({ type, size = 18 }: { type: PetType; size?: number }) {
  const Icon = ICONS[type];
  return <Icon size={size} aria-hidden />;
}
