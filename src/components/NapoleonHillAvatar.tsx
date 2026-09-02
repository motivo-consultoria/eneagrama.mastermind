import React, { useState, useEffect } from "react";
import napoleonCustomPortrait from "../assets/images/napoleon-hill-custom.png";
import napoleonDefaultPortrait from "../assets/images/napoleon_avatar_1788304974269.jpg";
import napoleonFallbackSvg from "../assets/images/napoleon-hill.svg";

interface NapoleonHillAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const NapoleonHillAvatar: React.FC<NapoleonHillAvatarProps> = ({
  size = "md",
  className = "",
}) => {
  const getInitialAvatar = () => {
    try {
      const stored = localStorage.getItem("napoleon_hill_custom_avatar");
      if (stored && (stored.startsWith("data:image") || stored.startsWith("blob:"))) {
        return stored;
      }
      if (stored && stored.startsWith("/")) {
        localStorage.removeItem("napoleon_hill_custom_avatar");
      }
    } catch {
      // ignore
    }
    return napoleonCustomPortrait || napoleonDefaultPortrait;
  };

  const [avatarSrc, setAvatarSrc] = useState<string>(getInitialAvatar);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("napoleon_hill_custom_avatar");
      if (stored && (stored.startsWith("data:image") || stored.startsWith("blob:"))) {
        setAvatarSrc(stored);
      } else {
        setAvatarSrc(napoleonCustomPortrait || napoleonDefaultPortrait);
      }
    } catch {
      setAvatarSrc(napoleonCustomPortrait || napoleonDefaultPortrait);
    }
  }, []);

  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full ring-1.5 ring-amber-500/40 shadow-xs overflow-hidden bg-neutral-900 select-none ${sizeMap[size]} ${className}`}
      title="Napoleon Hill - Mentor MasterMind"
    >
      <img
        src={avatarSrc}
        onError={() => {
          if (avatarSrc !== napoleonDefaultPortrait) {
            setAvatarSrc(napoleonDefaultPortrait);
          } else if (avatarSrc !== napoleonFallbackSvg) {
            setAvatarSrc(napoleonFallbackSvg);
          }
        }}
        alt="Napoleon Hill - Mentor MasterMind"
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};
