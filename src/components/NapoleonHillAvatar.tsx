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
  // Use user's edited/uploaded custom image if saved, otherwise custom imported portrait, then fallback
  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    return (
      localStorage.getItem("napoleon_hill_custom_avatar") ||
      napoleonCustomPortrait ||
      napoleonDefaultPortrait
    );
  });

  useEffect(() => {
    const stored = localStorage.getItem("napoleon_hill_custom_avatar");
    if (stored) {
      setAvatarSrc(stored);
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
          // Fallbacks in order: custom portrait -> default portrait -> bundled svg
          if (avatarSrc !== napoleonCustomPortrait) {
            setAvatarSrc(napoleonCustomPortrait);
          } else if (avatarSrc !== napoleonDefaultPortrait) {
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
