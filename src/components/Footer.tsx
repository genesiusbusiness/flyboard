"use client";

import Link from "next/link";
import { Info, Briefcase, Mail, FileText, Shield, ExternalLink, Home } from "lucide-react";

interface FooterProps {
  variant?: "default" | "discrete";
}

export function Footer({ variant = "default" }: FooterProps) {
  const isDiscrete = variant === "discrete";
  
  return (
    <footer className={`relative border-t ${isDiscrete ? "border-white/10" : "border-white/20"} glass-footer ${isDiscrete ? "mt-8 md:mt-12" : "mt-12 md:mt-20"} ${isDiscrete ? "opacity-60" : ""}`}>
      <div className={`max-w-7xl mx-auto px-4 md:px-6 ${isDiscrete ? "py-6 md:py-8" : "py-8 md:py-16"}`}>
        {/* Top Section: Logo and Vision */}
        {!isDiscrete && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Logo Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] rounded-xl blur-sm opacity-50"></div>
                  <img 
                    src="/favicon.png" 
                    alt="FlyBoard" 
                    className="relative w-10 h-10 rounded-xl shadow-lg object-cover border-2 border-white/30"
                  />
                </div>
                <span className="text-2xl font-semibold vibrant-accent-text">FlyBoard</span>
              </div>
              <p className="text-gray-600 font-light leading-relaxed max-w-md">
                Plateforme de gestion de projets, idées et roadmap pour l'écosystème Flynesis.
              </p>
            </div>

            {/* Columns Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* FlyBoard Column */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  FlyBoard
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/dashboard" className="footer-link group">
                      <Home className="w-4 h-4 footer-link-icon" />
                      <span>Dashboard</span>
                    </Link>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Votre espace de gestion de projets.</p>
                  </li>
                  <li>
                    <a 
                      href="https://flynesis.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <Info className="w-4 h-4 footer-link-icon" />
                      <span>Flynesis</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Découvrez l'écosystème <span className="vibrant-accent-text font-semibold">Flynesis</span>.</p>
                  </li>
                  <li>
                    <a 
                      href="https://flynesis.com/contact" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <Mail className="w-4 h-4 footer-link-icon" />
                      <span>Contact</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Écrivez-nous pour toute collaboration ou question.</p>
                  </li>
                  <li>
                    <a 
                      href="https://flynesis.com/careers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <Briefcase className="w-4 h-4 footer-link-icon" />
                      <span>Carrières</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Rejoignez l'aventure <span className="vibrant-accent-text font-semibold">Flynesis</span>.</p>
                  </li>
                </ul>
              </div>

              {/* Légal Column */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  Légal
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://flynesis.com/legal" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <FileText className="w-4 h-4 footer-link-icon" />
                      <span>Mentions légales</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Informations légales et éditoriales du site.</p>
                  </li>
                  <li>
                    <a 
                      href="https://flynesis.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <Shield className="w-4 h-4 footer-link-icon" />
                      <span>Confidentialité</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Vos données personnelles sont protégées et respectées.</p>
                  </li>
                  <li>
                    <a 
                      href="https://flynesis.com/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="footer-link group"
                    >
                      <FileText className="w-4 h-4 footer-link-icon" />
                      <span>CGU</span>
                      <ExternalLink className="w-3 h-3 footer-link-icon ml-1" />
                    </a>
                    <p className="text-xs text-gray-500 font-light mt-1 ml-7">Les règles d'utilisation du service.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: Inspirational message and Copyright */}
        <div className={`${isDiscrete ? "pt-4" : "pt-8"} border-t ${isDiscrete ? "border-white/5" : "border-white/10"}`}>
          {!isDiscrete && (
            <p className="text-base text-gray-700 font-light text-center mb-4">
              Organisez vos projets. Réalisez vos idées. Construisez l'avenir.
            </p>
          )}
          <p className={`${isDiscrete ? "text-xs" : "text-sm"} text-gray-500 font-light text-center`}>
            © 2025 FlyBoard - Flynesis. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

