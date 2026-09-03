/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { ChatScreen, ChatMessage } from "./components/ChatScreen";
import { EnneagramGuideModal } from "./components/EnneagramGuideModal";
import { SummaryCardModal, SummaryData } from "./components/SummaryCardModal";
import { PILLARS } from "./data/enneagramData";

export default function App() {
  const [currentPillarId, setCurrentPillarId] = useState<"feedback" | "sos" | "bussola" | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

  const handleSelectPillar = (pillarId: "feedback" | "sos" | "bussola") => {
    setCurrentPillarId(pillarId);
  };

  const handleBackToHome = () => {
    setCurrentPillarId(null);
  };

  const handleOpenSummary = async (messages: ChatMessage[]) => {
    setIsSummaryOpen(true);
    setIsSummaryLoading(true);

    const pillar = currentPillarId ? PILLARS[currentPillarId] : PILLARS.feedback;

    // Detect enneatypes in conversation messages
    const allText = messages.map((m) => m.content).join(" ");
    const matches = Array.from(allText.matchAll(/(?:eneatipo|padr[ãa]o|tipo)\s*([1-9])/gi));
    const uniqueTypes = Array.from(new Set(matches.map((m) => m[1])));
    const enneatypesDetected = uniqueTypes.length > 0 
      ? `Padrão-Master: ${uniqueTypes.join(", ")}` 
      : "Padrão-Master Vitruviano";

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarId: currentPillarId || "feedback",
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          enneatypesDetected,
        }),
      });

      const data = await response.json();
      setSummaryData({
        title: data.title || pillar.title,
        enneatypeText: data.enneatypeText || enneatypesDetected,
        keyLearnings: data.keyLearnings || [
          "Mapeamento do padrão de comportamento e ativação da virtude correspondente.",
          "Estratégia de comunicação orientada para alta performance e alinhamento mútuo.",
          "Superação do vício emocional com foco em resultados sustentáveis.",
          "Desafio prático de liderança para implementação imediata."
        ],
        quote: data.quote || "A verdadeira liderança nasce do autodomínio e da elevação contínua do outro.",
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      });
    } catch (error) {
      console.error("Erro ao gerar resumo da sessão:", error);
      setSummaryData({
        title: pillar.title,
        enneatypeText: enneatypesDetected,
        keyLearnings: [
          "Identificação do padrão e conscientização dos gatilhos de estresse.",
          "Acesso à virtude correspondente para restauração do autodomínio.",
          "Aplicação de comunicação assertiva sem despertar defesas.",
          "Compromisso prático de liderança MasterMind."
        ],
        quote: "Você não é o seu padrão, você se encontra nele. A virtude é a chave do autêntico líder.",
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-red-500/20 selection:text-red-900">
      {/* View routing based on selected pillar */}
      {currentPillarId ? (
        <ChatScreen
          pillarId={currentPillarId}
          onBackToHome={handleBackToHome}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSummary={handleOpenSummary}
        />
      ) : (
        <HomeScreen
          onSelectPillar={handleSelectPillar}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      )}

      {/* Guide Modal */}
      <EnneagramGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Summary Card Export Modal */}
      <SummaryCardModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summaryData={summaryData}
        isLoading={isSummaryLoading}
      />
    </div>
  );
}
