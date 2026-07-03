import React, { useState, useEffect } from "react";
import { Battery, Wifi, Signal, RefreshCw, Home, Layers, ChevronLeft } from "lucide-react";

interface AndroidSimulatorProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AndroidSimulator({ children, activeTab, onTabChange }: AndroidSimulatorProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="android-phone-frame" className="relative mx-auto w-full max-w-[400px] aspect-[9/19.5] bg-neutral-900 rounded-[55px] p-3.5 shadow-2xl border-4 border-neutral-800 ring-12 ring-neutral-900/10 overflow-hidden flex flex-col select-none">
      {/* Câmera Frontal / Notch Dinâmico */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3.5">
        <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full border border-neutral-700"></div>
        <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full"></div>
      </div>

      {/* Botões do Celular Simulados (Lateral) */}
      <div className="absolute right-[-4px] top-32 w-1 h-14 bg-neutral-700 rounded-l-md z-40"></div>
      <div className="absolute right-[-4px] top-52 w-1 h-20 bg-neutral-700 rounded-l-md z-40"></div>

      {/* Conteúdo Interno do Celular */}
      <div className="flex-1 bg-[#f8fafc] rounded-[42px] overflow-hidden flex flex-col relative">
        {/* Barra de Status Android */}
        <div className="h-11 bg-[#f8fafc] text-neutral-800 px-6 flex items-end justify-between pb-1.5 text-xs font-semibold z-40">
          <span className="text-xs leading-none tracking-tight">{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">98%</span>
              <Battery className="w-4 h-4 fill-neutral-800" />
            </div>
          </div>
        </div>

        {/* Tela do Aplicativo Leve */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-[#f8fafc]">
          {children}
        </div>

        {/* Barra de Navegação Android Virtual (Botões virtuais na parte inferior) */}
        <div className="h-12 bg-white/80 backdrop-blur-md border-t border-neutral-200/50 flex items-center justify-around px-8 z-40 pb-1">
          <button 
            onClick={() => {
              if (activeTab !== "hoje") onTabChange("hoje");
            }}
            className="p-2 text-neutral-500 hover:text-neutral-900 active:scale-90 transition-transform"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onTabChange("hoje")}
            className="p-2 text-neutral-500 hover:text-neutral-900 active:scale-90 transition-transform"
            title="Início"
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onTabChange("ajustes")}
            className="p-2 text-neutral-500 hover:text-neutral-900 active:scale-90 transition-transform"
            title="Menu do Sistema"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Gesto Home do Android */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-800 rounded-full z-40 opacity-50"></div>
      </div>
    </div>
  );
}
