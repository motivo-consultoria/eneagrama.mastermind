import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { MasterMindLogo } from "./MasterMindLogo";
import {
  Download,
  X,
  Check,
  Sparkles,
  Copy,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Camera,
  Maximize2,
  Minimize2,
  Info,
  Monitor,
  Smartphone,
  Apple,
} from "lucide-react";

export interface SummaryData {
  title: string;
  enneatypeText: string;
  keyLearnings: string[];
  quote: string;
  date?: string;
}

interface SummaryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: SummaryData | null;
  isLoading: boolean;
}

export const SummaryCardModal: React.FC<SummaryCardModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  isLoading,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showPrintTips, setShowPrintTips] = useState(false);
  const [isCleanView, setIsCleanView] = useState(false);

  if (!isOpen) return null;

  const currentDate = summaryData?.date || new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        logging: false,
        imageTimeout: 10000,
      });

      // 1. Generate Blob & DataURL
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      setGeneratedImageUrl(dataUrl);

      canvas.toBlob((blob) => {
        const urlToDownload = blob ? URL.createObjectURL(blob) : dataUrl;
        const downloadLink = document.createElement("a");
        const fileName = `resumo-mastermind-${Date.now()}.png`;
        downloadLink.download = fileName;
        downloadLink.href = urlToDownload;
        downloadLink.target = "_blank";
        document.body.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(() => {
          document.body.removeChild(downloadLink);
          if (blob) URL.revokeObjectURL(urlToDownload);
        }, 1500);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }, "image/png", 1.0);
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      // Fallback: try direct dataURL extraction
      try {
        if (cardRef.current) {
          const fallbackCanvas = await html2canvas(cardRef.current, {
            scale: 2,
            backgroundColor: "#FFFFFF",
          });
          const img = fallbackCanvas.toDataURL("image/png");
          setGeneratedImageUrl(img);
          const link = document.createElement("a");
          link.download = `resumo-mastermind-${Date.now()}.png`;
          link.href = img;
          link.click();
          setDownloadSuccess(true);
        }
      } catch (innerErr) {
        console.error("Erro no fallback de imagem:", innerErr);
        setShowPrintTips(true);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImageToClipboard = async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      setGeneratedImageUrl(dataUrl);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Attempt modern Async Clipboard API
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            setImageCopied(true);
            setTimeout(() => setImageCopied(false), 3000);
          } else {
            handleCopyText();
          }
        } catch (e) {
          console.warn("ClipboardItem write failed, fallback to text:", e);
          handleCopyText();
        } finally {
          setIsDownloading(false);
        }
      }, "image/png");
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
      setIsDownloading(false);
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    if (!summaryData) return;
    const text = `🎯 Resumo Executivo MasterMind: ${summaryData.title}
📅 Data: ${currentDate}
👤 Foco: ${summaryData.enneatypeText}

📌 Principais Aprendizados & Diretrizes:
${summaryData.keyLearnings.map((l, i) => `${i + 1}. ${l}`).join("\n")}

💬 Sabedoria MasterMind:
"${summaryData.quote}"

Fundação Napoleon Hill • MasterMind® Treinamentos de Alta Performance`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className={`relative w-full ${isCleanView ? "max-w-2xl" : "max-w-xl"} flex flex-col bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden my-auto transition-all`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-executive">
              {isCleanView ? "Modo Captura de Tela (Print Limpo)" : "Resumo Visual da Sessão"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCleanView(!isCleanView)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              title={isCleanView ? "Voltar à visualização normal" : "Modo tela cheia para print limpo"}
            >
              {isCleanView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center bg-white max-h-[85vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <p className="text-sm text-neutral-700 font-medium">
                Sintetizando aprendizados e gerando o Card Executivo...
              </p>
            </div>
          ) : summaryData ? (
            <>
              {/* THE EXPORTABLE CARD (Captured by html2canvas on pure white) */}
              <div
                ref={cardRef}
                id="executive-summary-card"
                className="w-full bg-white p-6 sm:p-8 rounded-2xl border-2 border-neutral-200 shadow-md relative overflow-hidden text-neutral-900"
                style={{ minHeight: "440px" }}
              >
                {/* Subtle decorative geometric accents */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-red-600/60" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-red-600/60" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-red-600/60" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-red-600/60" />

                {/* Card Top Brand */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5 mb-5">
                  <MasterMindLogo size="sm" showSubtitle={false} className="p-0 border-0 shadow-none bg-transparent" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 block">
                      Eneagrama Vitruviano
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">
                      {currentDate}
                    </span>
                  </div>
                </div>

                {/* Card Title & Focus */}
                <div className="mb-5">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-[11px] font-semibold mb-1.5">
                    {summaryData.title}
                  </div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight font-executive">
                    Síntese de Liderança e Inteligência Emocional
                  </h4>
                  {summaryData.enneatypeText && (
                    <p className="text-xs text-neutral-600 font-medium mt-1">
                      <span className="text-red-700 font-bold">Foco: </span>
                      {summaryData.enneatypeText}
                    </p>
                  )}
                </div>

                {/* Key Learnings */}
                <div className="space-y-3 mb-6">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Principais Aprendizados & Diretrizes:
                  </span>
                  <div className="space-y-2.5">
                    {summaryData.keyLearnings.map((learning, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-neutral-800 leading-snug font-normal">
                          {learning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border-l-3 border-amber-600 text-neutral-800 text-xs italic mb-5 shadow-2xs font-medium">
                  "{summaryData.quote}"
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-[10px] text-neutral-500">
                  <span>Fundação Napoleon Hill</span>
                  <span className="font-bold text-neutral-700 tracking-wider">
                    ALTA PERFORMANCE EXECUTIVA
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS & SCREENSHOT GUIDANCE */}
              {!isCleanView && (
                <div className="w-full space-y-3 mt-5">
                  {/* Primary Download & Copy Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={handleDownloadImage}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gerando Imagem...</span>
                        </>
                      ) : downloadSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Download Concluído!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Baixar Imagem (PNG)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyImageToClipboard}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-sm border border-neutral-300 transition-colors cursor-pointer"
                    >
                      {imageCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Imagem Copiada!</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-neutral-600" />
                          <span>Copiar Imagem</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary Actions Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={handleCopyText}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium text-xs border border-neutral-200 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Resumo em Texto</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowPrintTips(!showPrintTips)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 font-medium text-xs border border-amber-200 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-700" />
                      <span>{showPrintTips ? "Ocultar Dicas de Print" : "Como Tirar Print da Tela"}</span>
                    </button>
                  </div>

                  {/* SCREENSHOT / PRINT SCREEN GUIDANCE ACCORDION / BOX */}
                  {showPrintTips && (
                    <div className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 animate-fadeIn text-xs text-neutral-700">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs border-b border-neutral-200 pb-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>Orientações para Captura de Tela (Print Screen):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Windows */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-[11px]">
                            <Monitor className="w-3.5 h-3.5 text-blue-600" />
                            <span>Windows (PC)</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-snug">
                            Pressione <kbd className="px-1 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">Win + Shift + S</kbd> ou a tecla <kbd className="px-1 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">PrtScn</kbd>.
                          </p>
                        </div>

                        {/* Mac */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-[11px]">
                            <Apple className="w-3.5 h-3.5 text-neutral-800" />
                            <span>Mac / Apple</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-snug">
                            Pressione <kbd className="px-1 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">Cmd + Shift + 4</kbd> e selecione a área do card.
                          </p>
                        </div>

                        {/* Celular / Mobile */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-[11px]">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Celular / Tablet</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-snug">
                            Pressione simultaneamente o <strong>Botão Liga/Desliga</strong> e <strong>Volume para Baixo</strong>.
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-500 italic">
                        💡 Se o download direto em PNG for restrito pelas políticas do seu navegador/iframe, o print da tela acima garante que você guarde as diretrizes com máxima nitidez.
                      </p>
                    </div>
                  )}

                  {/* Generated Image direct open fallback link */}
                  {generatedImageUrl && (
                    <div className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs text-neutral-600 animate-fadeIn">
                      <span className="text-[11px]">Imagem sintetizada com sucesso.</span>
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold underline text-xs"
                      >
                        <span>Abrir imagem em nova guia</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isCleanView && (
                <div className="w-full mt-4 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <span className="text-xs text-neutral-700">
                    📸 <strong>Modo Limpo:</strong> Posicione o card e capture seu print agora.
                  </span>
                  <button
                    onClick={() => setIsCleanView(false)}
                    className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Voltar aos Botões
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-500 py-8">
              Nenhum dado de resumo disponível para esta conversa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
