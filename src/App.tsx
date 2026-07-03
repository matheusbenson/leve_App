import React, { useState, useEffect } from "react";
import { Flame, Droplets, Scale, Settings, BookOpen, Sparkles, Smartphone, Download, ShieldCheck, Share2 } from "lucide-react";
import AndroidSimulator from "./components/AndroidSimulator";
import PlayStorePublisher from "./components/PlayStorePublisher";
import TodayTab from "./components/TodayTab";
import MenuTab from "./components/MenuTab";
import WaterTab from "./components/WaterTab";
import WeightTab from "./components/WeightTab";
import SettingsTab from "./components/SettingsTab";
import { FoodEntry, WeightEntry, UserConfig } from "./types";

const STORE_PREFIX = "leve:";

// Helper para chave do dia atual formatado (AAAA-MM-DD)
const getTodayKey = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("hoje");
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [water, setWater] = useState<number>(0);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  
  const [config, setConfig] = useState<UserConfig>({
    calorieGoal: 2000,
    waterGoal: 2000,
    weightGoal: 70,
    sex: "F",
    age: 26,
    height: 165,
    activity: "1.375",
    name: "Usuário"
  });

  const [isMobileView, setIsMobileView] = useState(false);

  // Carregar dados salvos no LocalStorage na inicialização do app
  useEffect(() => {
    // Detectar largura da janela para adaptar layout (se for menor que 800px foca 100% no telefone)
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 850);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Carregar configurações
    const storedConfig = localStorage.getItem(`${STORE_PREFIX}config`);
    if (storedConfig) {
      try {
        setConfig(JSON.parse(storedConfig));
      } catch (e) {
        console.error(e);
      }
    }

    // Carregar diário de alimentos do dia atual
    const todayKey = getTodayKey();
    const storedDay = localStorage.getItem(`${STORE_PREFIX}day:${todayKey}`);
    if (storedDay) {
      try {
        const parsed = JSON.parse(storedDay);
        if (parsed.foods) setFoods(parsed.foods);
        if (parsed.water !== undefined) setWater(parsed.water);
      } catch (e) {
        console.error(e);
      }
    }

    // Carregar histórico de pesagem
    const storedWeights = localStorage.getItem(`${STORE_PREFIX}weights`);
    if (storedWeights) {
      try {
        setWeights(JSON.parse(storedWeights));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Se não houver pesagem, inicializa com uma padrão de exemplo histórico
      const defaultWeights: WeightEntry[] = [
        { id: "1", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), w: 76.5 },
        { id: "2", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), w: 75.8 },
        { id: "3", date: new Date().toISOString(), w: 75.2 }
      ];
      setWeights(defaultWeights);
      localStorage.setItem(`${STORE_PREFIX}weights`, JSON.stringify(defaultWeights));
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Salvar configurações
  const handleUpdateConfig = (newConfig: UserConfig) => {
    setConfig(newConfig);
    localStorage.setItem(`${STORE_PREFIX}config`, JSON.stringify(newConfig));
  };

  // Salvar alimentos e água do dia
  const saveDayData = (updatedFoods: FoodEntry[], updatedWater: number) => {
    const todayKey = getTodayKey();
    localStorage.setItem(
      `${STORE_PREFIX}day:${todayKey}`,
      JSON.stringify({ foods: updatedFoods, water: updatedWater })
    );
  };

  const handleAddFood = (name: string, kcal: number, category: string) => {
    const newEntry: FoodEntry = {
      id: String(Date.now()),
      name,
      kcal,
      category,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };
    const updated = [...foods, newEntry];
    setFoods(updated);
    saveDayData(updated, water);
  };

  const handleRemoveFood = (id: string) => {
    const updated = foods.filter((f) => f.id !== id);
    setFoods(updated);
    saveDayData(updated, water);
  };

  const handleAddWater = (ml: number) => {
    const updatedWater = Math.max(0, water + ml);
    setWater(updatedWater);
    saveDayData(foods, updatedWater);
  };

  const handleUpdateWaterGoal = (goal: number) => {
    const updated = { ...config, waterGoal: goal };
    setConfig(updated);
    localStorage.setItem(`${STORE_PREFIX}config`, JSON.stringify(updated));
  };

  const handleLogWeight = (w: number) => {
    const newEntry: WeightEntry = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      w
    };
    const updated = [...weights, newEntry];
    setWeights(updated);
    localStorage.setItem(`${STORE_PREFIX}weights`, JSON.stringify(updated));
  };

  const handleUpdateWeightGoal = (goal: number) => {
    const updated = { ...config, weightGoal: goal };
    setConfig(updated);
    localStorage.setItem(`${STORE_PREFIX}config`, JSON.stringify(updated));
  };

  const handleResetToday = () => {
    setFoods([]);
    setWater(0);
    saveDayData([], 0);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setFoods([]);
    setWater(0);
    setWeights([
      { id: "1", date: new Date().toISOString(), w: 75.0 }
    ]);
    setConfig({
      calorieGoal: 2000,
      waterGoal: 2000,
      weightGoal: 70,
      sex: "F",
      age: 26,
      height: 165,
      activity: "1.375"
    });
  };

  const lastWeight = weights.length > 0 ? weights[weights.length - 1].w : null;

  // Renderizar o conteúdo da aba correspondente dentro do celular
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "hoje":
        return (
          <TodayTab 
            foods={foods}
            water={water}
            calorieGoal={config.calorieGoal}
            waterGoal={config.waterGoal}
            weightGoal={config.weightGoal}
            lastWeight={lastWeight}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            onAddWater={handleAddWater}
            onTabChange={setActiveTab}
          />
        );
      case "cardapio":
        return (
          <MenuTab 
            onAddFood={handleAddFood}
            userProfile={{
              ...config,
              lastWeight
            }}
          />
        );
      case "agua":
        return (
          <WaterTab 
            water={water}
            waterGoal={config.waterGoal}
            onAddWater={handleAddWater}
            onUpdateWaterGoal={handleUpdateWaterGoal}
          />
        );
      case "peso":
        return (
          <WeightTab 
            weights={weights}
            weightGoal={config.weightGoal}
            height={config.height}
            onLogWeight={handleLogWeight}
            onUpdateWeightGoal={handleUpdateWeightGoal}
          />
        );
      case "ajustes":
        return (
          <SettingsTab 
            config={config}
            lastWeight={lastWeight}
            onUpdateConfig={handleUpdateConfig}
            onResetToday={handleResetToday}
            onClearAllData={handleClearAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-neutral-100 flex flex-col font-sans">
      
      {/* Barra de Navegação Superior da Plataforma */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-green-900/30">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight text-white flex items-center gap-2">
              Leve <span className="text-xs bg-green-900/60 text-green-400 font-bold px-2 py-0.5 rounded-full border border-green-800/40">App Android de Saúde</span>
            </h1>
            <p className="text-xs text-neutral-400">Desenvolvido com Capacitor, React e Inteligência Artificial do Google Gemini</p>
          </div>
        </div>

        {/* Botão de Toggle para Mobile */}
        {isMobileView && (
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab(activeTab === "exportar" ? "hoje" : "exportar")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${activeTab === "exportar" ? "bg-amber-600 border-amber-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"}`}
            >
              <Share2 className="w-4 h-4" />
              {activeTab === "exportar" ? "Ver App Leve" : "Instruções Play Store"}
            </button>
          </div>
        )}
      </header>

      {/* Conteúdo Principal Responsivo (Split-Pane ou Full-Screen) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center justify-center">
        
        {/* Painel do Celular Android (Coluna da Esquerda / Centro se Mobile) */}
        <div className={`${isMobileView && activeTab === "exportar" ? "hidden" : "lg:col-span-5"} flex items-center justify-center`}>
          <AndroidSimulator activeTab={activeTab} onTabChange={setActiveTab}>
            
            {/* Header Interno do Aplicativo Leve */}
            <header className="px-5 pt-5 pb-2.5 flex items-baseline justify-between bg-brandbg shrink-0 border-b border-neutral-100">
              <div className="font-sans font-extrabold text-2xl tracking-tight text-textmain flex items-center gap-1">
                Le<span className="text-primary">ve</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-3"></span>
              </div>
              <span className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider">
                {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </header>

            {/* Corpo Ativo */}
            <div className="flex-1 flex flex-col overflow-hidden bg-brandbg">
              {renderActiveTabContent()}
            </div>

            {/* Menu Inferior do Aplicativo Leve */}
            <nav className="absolute bottom-12 left-0 right-0 bg-white border-t border-neutral-100 flex py-1.5 px-2 z-30 shadow-lg justify-around">
              <button 
                onClick={() => setActiveTab("hoje")}
                className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] font-bold rounded-xl transition-all ${activeTab === "hoje" ? "text-primary bg-primary/10" : "text-textmuted hover:text-textmain"}`}
              >
                <Flame className="w-4 h-4" /> Hoje
              </button>
              <button 
                onClick={() => setActiveTab("cardapio")}
                className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] font-bold rounded-xl transition-all ${activeTab === "cardapio" ? "text-primary bg-primary/10" : "text-textmuted hover:text-textmain"}`}
              >
                <BookOpen className="w-4 h-4" /> Cardápio
              </button>
              <button 
                onClick={() => setActiveTab("agua")}
                className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] font-bold rounded-xl transition-all ${activeTab === "agua" ? "text-primary bg-primary/10" : "text-textmuted hover:text-textmain"}`}
              >
                <Droplets className="w-4 h-4" /> Água
              </button>
              <button 
                onClick={() => setActiveTab("peso")}
                className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] font-bold rounded-xl transition-all ${activeTab === "peso" ? "text-primary bg-primary/10" : "text-textmuted hover:text-textmain"}`}
              >
                <Scale className="w-4 h-4" /> Peso
              </button>
              <button 
                onClick={() => setActiveTab("ajustes")}
                className={`flex-1 py-1 flex flex-col items-center gap-0.5 text-[9px] font-bold rounded-xl transition-all ${activeTab === "ajustes" ? "text-primary bg-primary/10" : "text-textmuted hover:text-textmain"}`}
              >
                <Settings className="w-4 h-4" /> Ajustes
              </button>
            </nav>

          </AndroidSimulator>
        </div>

        {/* Painel do Publicador da Play Store (Coluna da Direita / Escondido no Mobile se o App estiver ativo) */}
        <div className={`${isMobileView && activeTab !== "exportar" ? "hidden" : "lg:col-span-7"} flex flex-col gap-4 w-full`}>
          <PlayStorePublisher />
        </div>

      </main>

    </div>
  );
}
