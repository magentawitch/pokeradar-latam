interface MarkerLabelProps {
  title: string;
  detail: string;
}

export function MarkerLabel({ title, detail }: MarkerLabelProps) {
  return (
    <span className="flex flex-col items-center rounded-sm border border-border bg-card/95 px-1.5 py-0.5 shadow-sm">
      <span className="text-xs font-semibold text-ink">{title}</span>
      <span className="font-mono text-[0.625rem] font-normal text-ink-muted">
        {detail}
      </span>
    </span>
  );
}
