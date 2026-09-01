import React, { useState, useEffect, useRef } from "react";
import { PILLARS, PillarConfig, ENNEAGRAM_TYPES, EnneatypeInfo } from "../data/enneagramData";
import { NapoleonHillAvatar } from "./NapoleonHillAvatar";
import {
  ArrowLeft,
  Send,
  BookOpen,
  FileDown,
  RotateCcw,
  User,
  Sparkles,
  Users,
  AlertTriangle,
  Compass,
  CheckCircle2,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

interface ChatScreenProps {
  pillarId: "feedback" | "sos" | "bussola";
  onBackToHome: () => void;
  onOpenGuide: () => void;
  onOpenSummary: (messages: ChatMessage[]) => void;
}

type SelectionStage = "user_type" | "peer_type" | "free_text";

export const ChatScreen: React.FC<ChatScreenProps> = ({
  pillarId,
  onBackToHome,
  onOpenGuide,
  onOpenSummary,
}) => {
  const currentPillar: PillarConfig = PILLARS[pillarId] || PILLARS.feedback;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-mentor-msg",
      role: "assistant",
      content: currentPillar.initialMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Step-by-step state for Enneagram selection
  const [userEnneatype, setUserEnneatype] = useState<number | null>(null);
  const [peerEnneatype, setPeerEnneatype] = useState<number | null>(null);
  const [stage, setStage] = useState<SelectionStage>("user_type");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, stage]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarId,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const replyContent = data.text || "Compreendido. Vamos avançar com este plano de ação.";

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 400);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Houve uma instabilidade na conexão, mas estou aqui com você. Por favor, reformule sua mensagem ou selecione seu padrão de liderança abaixo.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Step 1: User chooses their own Enneatype
  const handleSelectUserType = (typeNum: number) => {
    setUserEnneatype(typeNum);
    const typeInfo = ENNEAGRAM_TYPES[typeNum];
    const userMsgText = `Meu padrão é o Tipo ${typeNum} (${typeInfo.name} - ${typeInfo.subtitle}).`;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (pillarId === "feedback") {
      // Move to Step 2: Ask for the other person's pattern
      setStage("peer_type");
      const mentorPrompt: ChatMessage = {
        id: `mentor-${Date.now() + 1}`,
        role: "assistant",
        content: `Excelente. Registrado: **Seu Padrão é o Tipo ${typeNum} (${typeInfo.name})** — virtude mestra da *${typeInfo.virtue}*.\n\nAgora, vamos ao segundo passo: **Qual é o Eneatipo do liderado ou da outra pessoa envolvida na conversa?**\n*Selecione uma das opções abaixo:*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg, mentorPrompt]);
    } else if (pillarId === "sos") {
      // SOS: Move to situation description
      setStage("free_text");
      const mentorPrompt: ChatMessage = {
        id: `mentor-${Date.now() + 1}`,
        role: "assistant",
        content: `Compreendido, líder Padrão ${typeNum} (${typeInfo.name}). Em momentos de alta pressão, seu desafio central é não ceder ao vício emocional do *${typeInfo.emotionalVice}*.\n\n**O que aconteceu especificamente que tirou você do eixo ou gerou esse estresse neste momento?**\n*Digite abaixo para receber as 2 ações práticas imediatas de domínio próprio.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg, mentorPrompt]);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      // Bussola: Move to daily challenge description
      setStage("free_text");
      const mentorPrompt: ChatMessage = {
        id: `mentor-${Date.now() + 1}`,
        role: "assistant",
        content: `Perfeito, líder Padrão ${typeNum} (${typeInfo.name}). Sua bússola hoje aponta diretamente para a virtude da *${typeInfo.virtue}*.\n\n**Qual é a sua principal reunião, decisão ou desafio executivo do dia de hoje?**\n*Digite abaixo para receber sua pílula de sabedoria e o desafio de 24h.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg, mentorPrompt]);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  };

  // Step 2 (Feedback Pillar only): User chooses the other person's Enneatype
  const handleSelectPeerType = (typeNum: number) => {
    setPeerEnneatype(typeNum);
    setStage("free_text");
    const peerInfo = ENNEAGRAM_TYPES[typeNum];
    const userMsgText = `O liderado/pessoa envolvida é Tipo ${typeNum} (${peerInfo.name} - ${peerInfo.subtitle}).`;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const mentorPrompt: ChatMessage = {
      id: `mentor-${Date.now() + 1}`,
      role: "assistant",
      content: `Entendido. Temos a dinâmica entre **Líder Tipo ${userEnneatype}** e **Liderado Tipo ${typeNum} (${peerInfo.name})**.\n\nPara calibrarmos o roteiro executivo com palavras exatas e gatilhos a evitar: **Qual é a situação concreta que precisa de alinhamento ou feedback?**\n*Descreva o fato ou comportamento abaixo:*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, mentorPrompt]);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Deseja reiniciar esta sessão de mentoria?")) {
      setUserEnneatype(null);
      setPeerEnneatype(null);
      setStage("user_type");
      setMessages([
        {
          id: `initial-${Date.now()}`,
          role: "assistant",
          content: currentPillar.initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  // Format mentor markdown text
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-2 text-sm leading-relaxed text-neutral-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Headings
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-base font-bold text-neutral-900 font-executive pt-1 border-b border-neutral-200 pb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-red-600 rounded-xs" />
                <span>{trimmed.replace("### ", "")}</span>
              </h4>
            );
          }
          if (trimmed.startsWith("#### ")) {
            return (
              <h5 key={idx} className="text-sm font-bold text-neutral-900 tracking-wide pt-1">
                {trimmed.replace("#### ", "")}
              </h5>
            );
          }

          // Blockquote
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote key={idx} className="p-3 my-1.5 rounded-r-xl bg-amber-50/80 border-l-3 border-amber-600 italic text-neutral-900 text-xs sm:text-sm shadow-2xs font-medium">
                {trimmed.replace("> ", "").replace(/"/g, "")}
              </blockquote>
            );
          }

          // Bullet points
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const itemText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-red-600 font-bold mt-1 text-xs">•</span>
                <span className="text-neutral-800">
                  {formatInlineBold(itemText)}
                </span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+/)?.[0];
            const itemText = trimmed.replace(/^\d+\.\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-4.5 h-4.5 rounded-full bg-red-100 border border-red-300 text-red-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {num}
                </span>
                <span className="text-neutral-800">
                  {formatInlineBold(itemText)}
                </span>
              </div>
            );
          }

          // Standard paragraph
          return <p key={idx} className="text-neutral-800">{formatInlineBold(trimmed)}</p>;
        })}
      </div>
    );
  };

  const formatInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-neutral-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900 max-w-4xl mx-auto border-x border-neutral-200">
      {/* Executive Header */}
      <header className="px-4 py-3 border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 border border-neutral-200 transition-colors cursor-pointer"
            title="Voltar para a tela inicial"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <NapoleonHillAvatar size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                  {currentPillar.badge}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 truncate max-w-[170px] sm:max-w-xs font-executive">
                  {currentPillar.title}
                </h2>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                Mentor Napoleon Hill • MasterMind®
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs border border-neutral-200 transition-colors cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Guia 9 Padrões</span>
          </button>

          <button
            onClick={() => onOpenSummary(messages)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            title="Gerar e Baixar Resumo Visual da Sessão"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Gerar Resumo</span>
            <span className="inline xs:hidden sm:hidden">Resumo</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border border-neutral-200 transition-colors cursor-pointer"
            title="Reiniciar conversa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-neutral-50/40">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              {isAssistant && (
                <NapoleonHillAvatar size="sm" className="mt-1" />
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-xs relative ${
                  isAssistant
                    ? "bg-white border border-neutral-200 text-neutral-900 rounded-tl-xs"
                    : "bg-neutral-900 border border-neutral-800 text-white rounded-tr-xs"
                }`}
              >
                {/* Message Header Label */}
                <div className={`flex items-center justify-between gap-4 mb-2 pb-1.5 border-b text-[11px] ${
                  isAssistant ? "border-neutral-200 text-neutral-500" : "border-neutral-700 text-neutral-300"
                }`}>
                  <span className={`font-semibold ${isAssistant ? "text-red-700 flex items-center gap-1" : "text-neutral-200"}`}>
                    {isAssistant ? "Napoleon Hill (Mentor MasterMind)" : "Você"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Content */}
                {isAssistant ? (
                  renderFormattedContent(msg.content)
                ) : (
                  <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed font-normal">
                    {msg.content}
                  </p>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0 shadow-xs mt-1 border border-neutral-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Simulator Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 justify-start animate-fadeIn">
            <NapoleonHillAvatar size="sm" className="mt-1" />
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-xs p-4 text-xs text-neutral-700 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-neutral-600 ml-1 font-medium">Napoleon Hill formulando orientação executiva...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* STEP-BY-STEP SELECTION PANEL: Presented ONE AT A TIME to eliminate confusion */}
      {stage === "user_type" && (
        <div className="border-t-2 border-red-600/30 bg-white p-3 sm:p-4 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Etapa 1 de {pillarId === "feedback" ? "2" : "1"}: Selecione o SEU Padrão Master</span>
            </div>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              Escolha uma opção para avançar
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-1.5">
            {Object.values(ENNEAGRAM_TYPES).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectUserType(t.id)}
                className="p-2 sm:p-2.5 rounded-xl border border-neutral-200 hover:border-red-600 hover:bg-red-50/60 bg-neutral-50/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-white group-hover:bg-red-600 group-hover:text-white text-neutral-800 font-bold text-xs flex items-center justify-center border border-neutral-300 group-hover:border-red-600 transition-colors">
                  {t.id}
                </span>
                <span className="text-[11px] font-bold text-neutral-900 group-hover:text-red-700 leading-tight">
                  {t.name.split("/")[0]}
                </span>
                <span className="text-[9px] text-neutral-500 line-clamp-1 group-hover:text-neutral-700">
                  {t.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "peer_type" && (
        <div className="border-t-2 border-amber-500/40 bg-white p-3 sm:p-4 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Etapa 2 de 2: Selecione o Padrão do LIDERADO / OUTRA PESSOA</span>
            </div>
            <button
              onClick={() => setStage("user_type")}
              className="text-[11px] text-red-700 hover:underline cursor-pointer"
            >
              ← Alterar meu padrão
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-1.5">
            {Object.values(ENNEAGRAM_TYPES).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectPeerType(t.id)}
                className="p-2 sm:p-2.5 rounded-xl border border-neutral-200 hover:border-amber-600 hover:bg-amber-50/60 bg-neutral-50/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-white group-hover:bg-amber-600 group-hover:text-white text-neutral-800 font-bold text-xs flex items-center justify-center border border-neutral-300 group-hover:border-amber-600 transition-colors">
                  {t.id}
                </span>
                <span className="text-[11px] font-bold text-neutral-900 group-hover:text-amber-800 leading-tight">
                  {t.name.split("/")[0]}
                </span>
                <span className="text-[9px] text-neutral-500 line-clamp-1 group-hover:text-neutral-700">
                  {t.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* When both patterns are selected, display confirmed summary tag bar */}
      {stage === "free_text" && (
        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">Padrões Definidos:</span>
            {userEnneatype && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-900 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-red-600" />
                Seu Padrão: {userEnneatype} ({ENNEAGRAM_TYPES[userEnneatype].name})
              </span>
            )}
            {peerEnneatype && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                Liderado: {peerEnneatype} ({ENNEAGRAM_TYPES[peerEnneatype].name})
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setStage("user_type");
              setUserEnneatype(null);
              setPeerEnneatype(null);
            }}
            className="text-[11px] text-neutral-600 hover:text-red-700 underline cursor-pointer"
          >
            Redefinir Padrões
          </button>
        </div>
      )}

      {/* Input Area */}
      <footer className="p-3 sm:p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-end gap-2 bg-neutral-50 border border-neutral-300 focus-within:border-red-500 focus-within:bg-white rounded-2xl p-2 transition-all shadow-xs">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              stage === "user_type"
                ? "Selecione seu padrão acima ou digite aqui..."
                : stage === "peer_type"
                ? "Selecione o padrão do liderado acima ou digite aqui..."
                : "Descreva o fato, situação ou desafio específico para Napoleon Hill..."
            }
            className="flex-1 bg-transparent border-0 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none resize-none px-2 py-1 max-h-32"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium shadow-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Enviar mensagem para Napoleon Hill"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500 px-1">
          <span>Pressione Enter para enviar • Shift+Enter para nova linha</span>
          <button
            onClick={() => onOpenSummary(messages)}
            className="text-red-700 hover:text-red-800 font-semibold underline decoration-red-300 cursor-pointer"
          >
            Gerar Resumo da Sessão
          </button>
        </div>
      </footer>
    </div>
  );
};
