import React, { useState, useEffect } from "react";
import { Flame, Droplets, Scale, Trash2, Plus, Sparkles, PlusCircle, ArrowRight, Lightbulb } from "lucide-react";
import { FoodEntry, UserConfig } from "../types";

interface TodayTabProps {
  foods: FoodEntry[];
  water: number;
  calorieGoal: number;
  waterGoal: number;
  weightGoal: number | null;
  lastWeight: number | null;
  onAddFood: (name: string, kcal: number, category: string) => void;
  onRemoveFood: (id: string) => void;
  onAddWater: (ml: number) => void;
  onTabChange: (tab: string) => void;
}

export default function TodayTab({
  foods,
  water,
  calorieGoal,
  waterGoal,
  weightGoal,
  lastWeight,
  onAddFood,
  onRemoveFood,
  onAddWater,
  onTabChange
}: TodayTabProps) {
  const [iaInput, setIaInput] = useState("");
  const [iaCategory, setIaCategory] = useState("Café da manhã");
  const [isProcessing, setIsProcessing] = useState(false);
  const [healthTip, setHealthTip] = useState("Beba água! Beber 1 copo de água a cada 2 horas ajuda a manter o metabolismo ativo.");
  const [loadingTip, setLoadingTip] = useState(false);

  // Buscar dica de saúde por IA
  const fetchHealthTip = async () => {
    setLoadingTip(true);
    try {
      const res = await fetch("/api/gemini/health-tip");
      const data = await res.json();
      if (data.tip) {
        setHealthTip(data.tip);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTip(false);
    }
  };

  useEffect(() => {
    fetchHealthTip();
  }, []);

  const totalKcal = foods.reduce((sum, f) => sum + f.kcal, 0);
  const remainingKcal = calorieGoal - totalKcal;
  const kcalPercent = Math.min(totalKcal / calorieGoal, 1);
  const circumference = 2 * Math.PI * 42; // R=42
  const dashOffset = circumference - kcalPercent * circumference;
  const isOverGoal = remainingKcal < 0;

  const waterPercent = Math.min(water / waterGoal, 1);

  const handleIaAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iaInput.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/gemini/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: iaInput, category: iaCategory })
      });
      const data = await res.json();
      if (data.foods && Array.isArray(data.foods)) {
        data.foods.forEach((food: { name: string; kcal: number }) => {
          onAddFood(food.name, food.kcal, iaCategory);
        });
        setIaInput("");
      } else {
        alert("Não foi possível analisar os alimentos. Tente listar de forma mais simples.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o serviço de IA. Verifique sua conexão.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-20 pt-2 select-none">
      
      {/* Banner de Dica de Saúde com IA */}
      <div className="bg-indigo-50/70 rounded-[24px] p-4 border border-indigo-100/50 flex gap-3 items-start relative overflow-hidden shadow-sm">
        <div className="p-2 bg-primary text-white rounded-[14px] shadow-sm shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider block">Dica Inteligente do Dr. Leve</span>
          <p className="text-xs text-textmain font-medium leading-relaxed mt-0.5">{healthTip}</p>
        </div>
        <button 
          onClick={fetchHealthTip}
          disabled={loadingTip}
          className="absolute right-2 top-2 p-1 hover:bg-indigo-100 rounded-lg text-primary transition-colors"
          title="Nova dica"
        >
          <RefreshIcon className={`w-3 h-3 ${loadingTip ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Card Principal - Anel de Calorias */}
      <div className="hero-gradient rounded-[28px] p-5 text-white relative overflow-hidden">
        {/* Background ambient bubble */}
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[-10px] left-[-10px] w-16 h-16 bg-white/10 rounded-full blur-lg"></div>

        <h3 className="text-[10px] font-extrabold text-white/80 uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
          <Flame className="w-4 h-4 text-accent fill-accent" /> Balanço de Calorias
        </h3>
        
        <div className="flex items-center gap-5 relative z-10">
          {/* Anel de Progresso SVG */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="9" 
                strokeDasharray={circumference} 
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-sans text-white leading-none">{totalKcal}</span>
              <span className="text-[9px] font-extrabold text-white/80 uppercase tracking-wider mt-0.5">kcal</span>
            </div>
          </div>

          {/* Dados e Estatísticas */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="text-xs text-white/90 font-semibold uppercase tracking-wider">
              Meta Diária: <span className="font-extrabold text-white text-sm ml-1">{calorieGoal} kcal</span>
            </div>
            <div className="text-xs text-white/95 font-medium">
              {isOverGoal ? "Excesso de" : "Faltam apenas"}: <span className="text-base font-black text-white ml-1">{Math.abs(remainingKcal)} kcal</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1 rounded-full ${isOverGoal ? 'bg-rose-500/30 text-rose-100 border border-rose-400/20' : 'bg-white/20 text-white border border-white/10'}`}>
                {isOverGoal ? "Excedeu a Meta ⚠️" : "Dentro do Objetivo ✨"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Entrada Inteligente IA */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider">Adicionar com Inteligência Artificial</h3>
          <span className="inline-flex items-center gap-1 text-[9px] bg-primary/15 text-primary font-extrabold px-2.5 py-1 rounded-full border border-primary/10">
            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Gemini AI
          </span>
        </div>
        
        <form onSubmit={handleIaAdd} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select 
              value={iaCategory} 
              onChange={(e) => setIaCategory(e.target.value)} 
              className="text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-bold"
            >
              <option value="Café da manhã">Manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Lanche">Lanche</option>
              <option value="Jantar">Jantar</option>
            </select>
            <input 
              type="text" 
              value={iaInput} 
              onChange={(e) => setIaInput(e.target.value)} 
              placeholder="Ex: comi 2 ovos, pão de queijo e café"
              className="flex-1 text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
            />
            <button 
              type="submit" 
              disabled={isProcessing || !iaInput.trim()}
              className="p-2.5 bg-primary hover:bg-primary/90 disabled:bg-neutral-100 text-white disabled:text-neutral-400 rounded-xl transition-all font-semibold shrink-0 shadow-sm"
            >
              {isProcessing ? "Lendo..." : <Plus className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[9px] text-textmuted leading-relaxed font-medium italic">Digite o que comeu. O Gemini AI estimará as porções e calorias de forma automática.</p>
        </form>
      </div>

      {/* Seção Rápida de Água */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Droplets className="w-3.5 h-3.5 fill-blue-500" /></span>
              Água Diária
            </h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-blue-600">{water}</span>
              <span className="text-[10px] text-textmuted font-extrabold">/ {waterGoal}ml</span>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3">
            <button 
              onClick={() => onAddWater(250)} 
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[10px] py-2 rounded-xl transition-colors"
            >
              +250ml
            </button>
            <button 
              onClick={() => onTabChange("agua")} 
              className="bg-neutral-50 hover:bg-neutral-100 text-textmuted hover:text-textmain font-extrabold text-[10px] px-2.5 rounded-xl transition-colors"
            >
              Ver
            </button>
          </div>
        </div>

        {/* Seção Rápida de Peso */}
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="p-1.5 bg-pink-50 text-secondary rounded-lg"><Scale className="w-3.5 h-3.5" /></span>
              Peso Atual
            </h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-secondary">{lastWeight ? `${lastWeight} kg` : "N/A"}</span>
              {weightGoal && (
                <span className="text-[10px] text-textmuted font-extrabold">Alvo: {weightGoal}kg</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => onTabChange("peso")} 
            className="w-full bg-pink-50 hover:bg-pink-100 text-secondary font-extrabold text-[10px] py-2 rounded-xl mt-3 transition-colors text-center block"
          >
            Registrar Pesagem
          </button>
        </div>
      </div>

      {/* Lista de Alimentos Consumidos Hoje */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider">Diário Alimentar</h3>
          <button 
            onClick={() => onTabChange("cardapio")} 
            className="text-[10px] font-extrabold text-primary hover:text-indigo-700 hover:underline flex items-center gap-0.5"
          >
            Cardápio Completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {foods.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
            {foods.map((food) => (
              <div key={food.id} className="flex justify-between items-center py-2.5 border-b border-neutral-100/60 last:border-0 group">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-textmain truncate">{food.name}</h4>
                  <span className="text-[9px] text-textmuted font-extrabold uppercase tracking-wider">{food.category} · {food.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-secondary">{food.kcal} kcal</span>
                  <button 
                    onClick={() => onRemoveFood(food.id)} 
                    className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-textmuted text-xs font-semibold leading-relaxed">
            Nenhum alimento adicionado hoje.<br />Use o campo de Inteligência Artificial acima ou consulte o Cardápio!
          </div>
        )}
      </div>

    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
