import React from "react";
import { PILLARS, PillarConfig } from "../data/enneagramData";
import { MasterMindLogo } from "./MasterMindLogo";
import { MessageSquareText, ShieldAlert, Compass, ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface HomeScreenProps {
  onSelectPillar: (pillarId: "feedback" | "sos" | "bussola") => void;
  onOpenGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPillar,
  onOpenGuide,
}) => {
  const getPillarIcon = (id: string) => {
    switch (id) {
      case "feedback":
        return <MessageSquareText className="w-6 h-6 text-amber-600" />;
      case "sos":
        return <ShieldAlert className="w-6 h-6 text-red-600" />;
      case "bussola":
        return <Compass className="w-6 h-6 text-red-700" />;
      default:
        return <Sparkles className="w-6 h-6 text-amber-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-neutral-900 px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto">
      {/* Top Header with Exact MasterMind Logo */}
      <header className="flex flex-col items-center text-center space-y-3 pt-2 sm:pt-4">
        <MasterMindLogo size="lg" showSubtitle={true} />

        <div className="space-y-3 mt-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-50 border border-amber-500/30 text-amber-800 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Eneagrama Sistêmico Vitruviano • Napoleon Hill</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-executive">
            Mentor Eneagrama MasterMind
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal pt-1 max-w-xl mx-auto">
            Bem-vindo. Sou seu mentor virtual de alta performance. Escolha abaixo qual área da sua liderança vamos desenvolver hoje:
          </p>
        </div>
      </header>

      {/* 3 Main Pillar Cards with Refined Responsive Diagramming */}
      <main className="my-5 sm:my-10 space-y-3.5 sm:space-y-4">
        {Object.values(PILLARS).map((pillar: PillarConfig) => {
          const isFeedback = pillar.id === "feedback";
          const isSos = pillar.id === "sos";

          return (
            <button
              key={pillar.id}
              onClick={() => onSelectPillar(pillar.id)}
              className="w-full group text-left p-4 sm:p-5 md:p-6 rounded-2xl bg-white hover:bg-neutral-50/90 border border-neutral-200 hover:border-red-600/40 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 sm:gap-3.5 relative overflow-hidden"
            >
              {/* Left Accent Stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isFeedback
                    ? "bg-amber-500"
                    : isSos
                    ? "bg-red-600"
                    : "bg-gradient-to-b from-amber-500 to-red-600"
                }`}
              />

              {/* Card Header & Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pl-1.5 sm:pl-2 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0">
                    {getPillarIcon(pillar.id)}
                  </div>

                  <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                    <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {pillar.badge}
                    </span>
                    <h2 className="text-[14.5px] xs:text-[15.5px] sm:text-lg font-bold text-neutral-900 group-hover:text-red-700 transition-colors font-executive tracking-tight truncate sm:whitespace-normal">
                      {pillar.id === "feedback" ? "Feedback Estratégico" : pillar.title}
                    </h2>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-600 group-hover:text-red-700 shrink-0">
                  <span className="whitespace-nowrap">Iniciar Mentoria</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Subtitle / Description */}
              <div className="pl-1.5 sm:pl-2 flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                  {pillar.subtitle}
                </p>

                {/* Mobile action indicator */}
                <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-red-600 shrink-0 ml-1">
                  <span>Iniciar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </main>

      {/* Quick Enneagram Guide & Confidentiality Info */}
      <footer className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-medium border border-neutral-200 shadow-2xs transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Consultar os 9 Padrões-Master</span>
        </button>

        <div className="flex items-center gap-2 text-center sm:text-right">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-neutral-500 font-medium">
            Sessão confidencial e anônima (sem login ou senha)
          </span>
        </div>
      </footer>
    </div>
  );
};
