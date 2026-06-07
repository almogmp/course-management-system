import type { RateSource } from "@/lib/financial/resolve-session-rates";

const RATE_SOURCE_LABELS: Record<RateSource, string> = {
  session: "מפגש",
  course: "קורס",
  none: "חסר",
};

export function formatRateSource(source: RateSource): string {
  return RATE_SOURCE_LABELS[source];
}
