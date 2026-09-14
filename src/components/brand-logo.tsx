"use client";

import React, { useState } from "react";
import { Coffee, Music } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  compactMobile?: boolean;
}

export function BrandLogo({
  size = "md",
  variant = "dark",
  showSubtitle = true,
  compactMobile = false,
}: BrandLogoProps) {
  const isLight = variant === "light";
  const [imgError, setImgError] = useState(false);

  const imgClass = `brand-logo-img brand-logo-img--${size}`;

  const fallbackClass = [
    "brand-logo-fallback",
    `brand-logo-fallback--${size}`,
    isLight ? "brand-logo-fallback--light" : "brand-logo-fallback--dark",
  ].join(" ");

  const nameClass = [
    "brand-logo-name",
    `brand-logo-name--${size}`,
    isLight ? "brand-logo-name--light" : "brand-logo-name--dark",
  ].join(" ");

  const tagClass = [
    "brand-logo-tag",
    isLight ? "brand-logo-tag--light" : "brand-logo-tag--dark",
    compactMobile ? "brand-logo-tag--compact-hide" : "",
  ].join(" ");

  const subtitleClass = [
    "brand-logo-subtitle",
    isLight ? "brand-logo-subtitle--light" : "brand-logo-subtitle--dark",
    compactMobile ? "brand-logo-subtitle--compact-hide" : "",
  ].join(" ");

  return (
    <div className="brand-logo">
      {!imgError ? (
        <img
          src="/logo.png"
          alt="Menu Guitara Logo"
          className={imgClass}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={fallbackClass}>
          <div className="brand-logo-fallback-icons">
            <Coffee size={size === "sm" ? 14 : 18} className="icon-main" />
            <Music size={size === "sm" ? 10 : 14} className="icon-accent" />
          </div>
        </div>
      )}

      <div className="brand-logo-text">
        <div className="brand-logo-name-row">
          <span className={nameClass}>GUITARA</span>
          <span className={tagClass}>CO-WORKING</span>
        </div>
        {showSubtitle && (
          <span className={subtitleClass}>Café &amp; Workspace</span>
        )}
      </div>
    </div>
  );
}
