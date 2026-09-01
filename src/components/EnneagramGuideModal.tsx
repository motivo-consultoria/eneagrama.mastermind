import React, { useState } from "react";
import { ENNEAGRAM_TYPES, EnneatypeInfo } from "../data/enneagramData";
import { X, ShieldAlert, Sparkles, BookOpen, Award } from "lucide-react";

interface EnneagramGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType?: (typeId: number) => void;
}

export const EnneagramGuideModal: React.FC<EnneagramGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);

  if (!isOpen) return null;

  const currentType: EnneatypeInfo = ENNEAGRAM_TYPES[selectedTypeId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-neutral-900">
              Guia dos 9 Padrões Master do Eneagrama
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="flex overflow-x-auto p-2 border-b border-neutral-200 bg-neutral-100/70 gap-1.5 scrollbar-thin">
          {Object.values(ENNEAGRAM_TYPES).map((t) => {
            const isSelected = t.id === selectedTypeId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTypeId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                }`}
              >
                <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? "bg-red-800 text-white" : "bg-neutral-200 text-neutral-800"
                }`}>
                  {t.id}
                </span>
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-800 bg-white">
          {/* Main Info Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-bold">
                  Padrão Master {currentType.id}
                </span>
                <h4 className="text-xl font-extrabold text-neutral-900 font-executive">
                  {currentType.name}
                </h4>
              </div>
              <span className="text-xs text-amber-700 font-semibold italic">
                {currentType.subtitle}
              </span>
            </div>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mt-2">
              {currentType.worldview}
            </p>
          </div>

          {/* Grid: Virtude vs Vício */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Virtude Mestra (Essência)</span>
              </div>
              <p className="text-neutral-900 font-bold text-sm">{currentType.virtue}</p>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                {currentType.dailyVirtueGuidance}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
              <div className="flex items-center gap-2 text-red-800 font-bold mb-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Vício Emocional & Fixação</span>
              </div>
              <p className="text-neutral-900 font-bold text-sm">
                {currentType.emotionalVice}
              </p>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Fixação Mental: {currentType.mentalFixation}
              </p>
            </div>
          </div>

          {/* Leadership & Communication */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600" />
              Estilo de Liderança MasterMind
            </h5>
            <p className="text-neutral-800 text-sm bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              {currentType.leadershipStyle}
            </p>
          </div>

          {/* Communication Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-800 block mb-1">
                ✓ Forças de Comunicação:
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                {currentType.communicationGifts.map((gift, idx) => (
                  <li key={idx}>{gift}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-800 block mb-1">
                ⚠ Gatilhos a Evitar:
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                {currentType.communicationTriggersToAvoid.map((trig, idx) => (
                  <li key={idx}>{trig}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Healing Attitude */}
          <div className="p-4 bg-amber-50/80 border-l-4 border-amber-600 rounded-r-xl">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block mb-1">
              Atitude de Cura (Napoleon Hill / MasterMind):
            </span>
            <p className="italic text-neutral-800 text-sm">
              "{currentType.healingAttitude}"
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <span className="text-xs text-neutral-500 hidden sm:inline italic">
            "Você não é o seu padrão, você se encontra nele."
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onSelectType && (
              <button
                onClick={() => {
                  onSelectType(currentType.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                Usar Tipo {currentType.id} no Chat
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
