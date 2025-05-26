import { ClipboardList } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <ClipboardList className="h-10 w-10 text-accent" />
      <h1 className="text-4xl font-bold tracking-tight" style={{color: 'hsl(var(--foreground))'}}>
        NutriSnap
      </h1>
    </div>
  );
}
