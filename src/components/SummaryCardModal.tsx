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
        alert("A imagem foi sintetizada na tela. Você pode copiá-la ou visualizá-la diretamente.");
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
          console.warn("ClipboardItem write failed, copying text fallback:", e);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg flex flex-col bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-executive">
              Resumo Visual da Sessão
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center bg-white">
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
                className="w-full bg-white p-6 sm:p-8 rounded-2xl border-2 border-neutral-200 shadow-lg relative overflow-hidden text-neutral-900"
                style={{ minHeight: "460px" }}
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
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-5">
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

              {/* Action Buttons */}
              <div className="w-full space-y-2.5 mt-5">
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

                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium text-xs border border-neutral-200 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Texto Copiado para Área de Transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Resumo em Formato de Texto</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Image direct open/preview fallback (Useful in iframes where browser security may restrict auto-downloads) */}
              {generatedImageUrl && (
                <div className="w-full mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs text-neutral-600 animate-fadeIn">
                  <span>Imagem sintetizada com sucesso.</span>
                  <a
                    href={generatedImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold underline"
                  >
                    <span>Abrir imagem em nova guia</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
