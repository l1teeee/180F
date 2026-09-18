import { FlaskConical, Pill } from "./pill";

export function DesignSystemHeader() {
  return (
    <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink">
          180 Fitness Studio
        </h1>
        <p className="text-[15px] font-medium text-text-secondary">Design system preview</p>
      </div>
      <Pill label="Demo Mode" tone="neutralBrand" icon={FlaskConical} />
    </header>
  );
}
