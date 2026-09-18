import type { Metadata } from "next";
import { DesignSystemHeader } from "./_components/header";
import { ColorSection } from "./_components/color-section";
import { TypographySection } from "./_components/typography-section";
import { ButtonsSection } from "./_components/buttons-section";
import { PillsSection } from "./_components/pills-section";
import { CardsSection } from "./_components/cards-section";
import { ChartsSection } from "./_components/charts-section";
import { InkChipBarSection } from "./_components/ink-chip-bar-section";
import { CategoryTilesSection } from "./_components/category-tiles-section";
import { DataSurfacesSection } from "./_components/data-surfaces-section";
import { OverlaysSection } from "./_components/overlays-section";
import { MotionSection } from "./_components/motion-section";

// Internal reference page only - never linked from navigation (docs/03, CLAUDE.md "Routes").
export const metadata: Metadata = {
  title: "Design system - 180 Fitness Studio",
  description: "Internal reference rendering of the 180 Fitness Studio visual language.",
};

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 p-7">
        <DesignSystemHeader />
        <ColorSection />
        <TypographySection />
        <ButtonsSection />
        <PillsSection />
        <CardsSection />
        <ChartsSection />
        <InkChipBarSection />
        <CategoryTilesSection />
        <DataSurfacesSection />
        <OverlaysSection />
        <MotionSection />
      </div>
    </main>
  );
}
