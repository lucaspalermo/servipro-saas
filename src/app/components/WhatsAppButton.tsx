"use client";

export default function WhatsAppButton() {
  const phoneNumber = "5548991420313";
  const message = encodeURIComponent("Ola! Tenho interesse no Servicfy");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse-ring" />
      <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />

      {/* Button */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-110">
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.004 0h-.008C7.174 0 .002 7.174.002 16c0 3.498 1.13 6.738 3.046 9.372L1.06 31.44l6.318-1.964A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16S24.826 0 16.004 0zm9.314 22.594c-.39 1.1-1.932 2.014-3.158 2.282-.84.178-1.938.32-5.632-1.21-4.726-1.956-7.766-6.756-8.004-7.07-.228-.314-1.916-2.55-1.916-4.864 0-2.314 1.212-3.452 1.642-3.924.39-.428 1.022-.622 1.628-.622.196 0 .372.01.53.018.47.02.706.048 1.016.786.39.926 1.34 3.268 1.458 3.506.118.238.236.554.076.868-.15.32-.282.52-.52.8-.238.282-.498.628-.712.844-.238.238-.486.496-.208.968.278.472 1.236 2.036 2.654 3.3 1.822 1.624 3.358 2.126 3.83 2.364.472.238.748.198 1.022-.118.282-.32 1.196-1.39 1.514-1.868.31-.472.628-.394 1.06-.236.432.15 2.762 1.302 3.234 1.54.472.236.786.354.904.554.118.196.118 1.14-.272 2.244z" />
        </svg>
      </div>

      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-2 rounded-lg bg-dark-800 text-white text-sm font-medium border border-dark-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale conosco no WhatsApp
        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-dark-800 border-r border-b border-dark-700 rotate-[-45deg]" />
      </div>
    </a>
  );
}
