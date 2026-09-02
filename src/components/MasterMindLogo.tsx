import React, { useState, useEffect } from "react";
import defaultLogoPng from "../assets/images/mastermind-logo.png";
import fallbackLogoSvg from "../assets/images/mastermind-logo.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  className?: string;
}

export const MasterMindLogo: React.FC<LogoProps> = ({
  size = "md",
  showSubtitle = true,
  className = "",
}) => {
  const getInitialLogo = () => {
    try {
      const stored = localStorage.getItem("mastermind_uploaded_logo");
      if (stored && (stored.startsWith("data:image") || stored.startsWith("blob:"))) {
        return stored;
      }
      // Remove any legacy stale relative path from localStorage
      if (stored && stored.startsWith("/")) {
        localStorage.removeItem("mastermind_uploaded_logo");
      }
    } catch {
      // ignore
    }
    return defaultLogoPng;
  };

  const [logoSrc, setLogoSrc] = useState<string>(getInitialLogo);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("mastermind_uploaded_logo");
        if (stored && (stored.startsWith("data:image") || stored.startsWith("blob:"))) {
          setLogoSrc(stored);
        } else {
          setLogoSrc(defaultLogoPng);
        }
      } catch {
        setLogoSrc(defaultLogoPng);
      }
    };
    window.addEventListener("logo_updated", handleStorage);
    return () => window.removeEventListener("logo_updated", handleStorage);
  }, []);

  const sizeStyles = {
    sm: {
      imgClass: "w-28 h-28 max-w-[120px]",
      subClass: "text-[10px]",
      padding: "p-1.5",
    },
    md: {
      imgClass: "w-36 h-36 max-w-[150px]",
      subClass: "text-xs",
      padding: "p-2",
    },
    lg: {
      imgClass: "w-48 h-48 sm:w-56 sm:h-56 max-w-[220px]",
      subClass: "text-xs sm:text-sm",
      padding: "p-2",
    },
    xl: {
      imgClass: "w-64 h-64 max-w-[280px]",
      subClass: "text-sm",
      padding: "p-3",
    },
  };

  const current = sizeStyles[size];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none bg-white rounded-2xl ${current.padding} ${className}`}
    >
      <img
        src={logoSrc}
        onError={() => {
          if (logoSrc !== fallbackLogoSvg) {
            setLogoSrc(fallbackLogoSvg);
          }
        }}
        alt="MasterMind Treinamentos de Alta Performance"
        className={`${current.imgClass} aspect-square object-contain mx-auto block`}
        width={350}
        height={350}
        loading="eager"
        decoding="sync"
      />

      {showSubtitle && (
        <span
          className={`text-neutral-500 font-semibold tracking-wider uppercase -mt-2 text-center ${current.subClass}`}
        >
          Treinamentos de Alta Performance
        </span>
      )}
    </div>
  );
};
