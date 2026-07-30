"use client";
import React from "react";
import {
  NotepadTextDashed,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";
// @ts-ignore
import { cn } from "../../lib/utils";
// @ts-ignore
import faviconImg from "../../favicon.jpg";
import "./modem-animated-footer.css";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  brandName = "AlzheimerAI",
  brandDescription = "AI-powered medical imaging for early detection of Alzheimer's disease. Empowering clinicians and researchers with deep learning insights.",
  socialLinks = [
    { icon: <Twitter className="w-full h-full" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-full h-full" />, href: "#", label: "LinkedIn" },
    { icon: <Github className="w-full h-full" />, href: "#", label: "GitHub" },
    { icon: <Mail className="w-full h-full" />, href: "#", label: "Email" },
  ],
  navLinks = [],
  creatorName = "AlzheimerAI Research Lab",
  creatorUrl = "https://alzheimerai.com",
  brandIcon,
  className = "",
}) => {
  return (
    <section className={cn("modem-footer-section", className)}>
      <footer className="modem-footer">
        <div className="modem-footer-inner">
          <div className="modem-footer-content">
            <div className="modem-footer-center">
              <div className="modem-brand-header">
                <span className="modem-brand-title">{brandName}</span>
                <p className="modem-brand-desc">{brandDescription}</p>
              </div>

              {socialLinks.length > 0 && (
                <div className="modem-social-row">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="modem-social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-tooltip={link.label}
                      title={link.label}
                    >
                      <div className="modem-social-icon">{link.icon}</div>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="modem-nav-row">
                  {navLinks.map((link, index) => (
                    <a key={index} className="modem-nav-link" href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modem-footer-bottom">
            <p className="modem-copyright">
              ©{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && (
              <nav className="modem-nav-row">
                <a
                  href={creatorUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modem-creator-link"
                >
                  Crafted by {creatorName}
                </a>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text watermark */}
        <div className="modem-watermark-text">
          {brandName ? brandName.toUpperCase() : ""}
        </div>

        {/* Bottom floating logo badge */}
        <div className="modem-bottom-logo-container">
          <div className="modem-logo-badge-inner">
            {brandIcon || (
              <img src={faviconImg} alt={`${brandName} Logo`} className="modem-logo-img" />
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="modem-bottom-line"></div>

        {/* Bottom shadow */}
        <div className="modem-bottom-shadow"></div>
      </footer>
    </section>
  );
};

export default Footer;