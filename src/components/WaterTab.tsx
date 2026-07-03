import React, { useState } from "react";
import { Droplets, Settings, Plus, Info, Award } from "lucide-react";

interface WaterTabProps {
  water: number;
  waterGoal: number;
  onAddWater: (ml: number) => void;
  onUpdateWaterGoal: (goal: number) => void;
}

export default function WaterTab({
  water,
  waterGoal,
  onAddWater,
  onUpdateWaterGoal
}: WaterTabProps) {
  const [newGoal, setNewGoal] = useState(String(waterGoal));
  const [isSetting, setIsSetting] = useState(false);

  // Calcula copos de 200ml necessários para a meta
  const totalGlasses = Math.ceil(waterGoal / 200);
  const filledGlasses = Math.floor(water / 200);

  const waterPercent = Math.min(water / waterGoal, 1);
  const isGoalReached = waterPercent >= 1;

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(newGoal);
    if (!isNaN(g) && g > 0) {
      onUpdateWaterGoal(g);
      setIsSetting(false);
      alert("Meta de hidratação atualizada com sucesso!");
    }
  };

  const toggleGlass = (index: number) => {
    if (index < filledGlasses) {
      // Remover a quantidade de copos até esse index
      const diff = (filledGlasses - index) * -200;
      onAddWater(diff);
    } else {
      // Adicionar copos até esse index
      const diff = (index + 1 - filledGlasses) * 200;
      onAddWater(diff);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-20 pt-2 select-none">
      
      {/* Banner de Celebração de Hidratação */}
      {isGoalReached && (
        <div className="bg-primary/10 text-primary rounded-[24px] p-4 border border-primary/20 flex gap-2.5 items-center shadow-sm">
          <span className="p-2 bg-primary text-white rounded-[14px] shadow-sm shrink-0">
            <Award className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider">Meta Concluída!</h4>
            <p className="text-[11px] font-semibold mt-0.5 opacity-90">Parabéns! Seu corpo está perfeitamente hidratado hoje.</p>
          </div>
        </div>
      )}

      {/* Card Principal - Hidrômetro */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col items-center text-center">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-4 flex items-center gap-1">
          <Droplets className="w-4 h-4 text-primary fill-primary" />
          Acompanhamento de Hidratação
        </h3>

        {/* Círculo Hidráulico SVG Animado */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Anel de Progresso */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="8" />
            <circle 
              cx="50" 
              cy="50" 
              r="44" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="8" 
              strokeDasharray={2 * Math.PI * 44} 
              strokeDashoffset={2 * Math.PI * 44 - waterPercent * (2 * Math.PI * 44)}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-textmain font-sans leading-none">{water}</span>
            <span className="text-xs text-textmuted font-bold mt-1">/ {waterGoal}ml</span>
            <span className="text-[10px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-extrabold mt-2 border border-primary/10">
              {Math.round(waterPercent * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Copos Interativos */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-2">Copos do Dia (200ml cada)</h3>
        <p className="text-[10px] text-textmuted font-medium mb-3">Clique para encher ou esvaziar os copos de água de forma rápida.</p>
        
        <div className="grid grid-cols-5 gap-3.5">
          {Array.from({ length: Math.max(totalGlasses, 10) }).map((_, i) => {
            const isFilled = i < filledGlasses;
            return (
              <button 
                key={i}
                onClick={() => toggleGlass(i)}
                className={`aspect-square rounded-[18px] border-2 flex flex-col items-center justify-center text-xl transition-all active:scale-90 cursor-pointer ${isFilled ? "bg-primary border-primary shadow-md shadow-primary/20 text-white" : "bg-brandbg border-neutral-200 text-primary"}`}
                title={`Copo ${i + 1}`}
              >
                💧
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingestão Rápida Personalizada */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-3">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider">Adicionar Rápido</h3>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => onAddWater(200)}
            className="flex flex-col items-center bg-indigo-50/50 hover:bg-indigo-50/80 text-primary border border-indigo-100/50 p-2.5 rounded-[20px] transition-all cursor-pointer"
          >
            <span className="text-lg">🥛</span>
            <span className="text-xs font-extrabold mt-1">200ml</span>
            <span className="text-[9px] text-primary/80 font-extrabold uppercase">Copo</span>
          </button>
          <button 
            onClick={() => onAddWater(350)}
            className="flex flex-col items-center bg-indigo-50/50 hover:bg-indigo-50/80 text-primary border border-indigo-100/50 p-2.5 rounded-[20px] transition-all cursor-pointer"
          >
            <span className="text-lg">🍵</span>
            <span className="text-xs font-extrabold mt-1">350ml</span>
            <span className="text-[9px] text-primary/80 font-extrabold uppercase">Caneca</span>
          </button>
          <button 
            onClick={() => onAddWater(500)}
            className="flex flex-col items-center bg-indigo-50/50 hover:bg-indigo-50/80 text-primary border border-indigo-100/50 p-2.5 rounded-[20px] transition-all cursor-pointer"
          >
            <span className="text-lg">🍼</span>
            <span className="text-xs font-extrabold mt-1">500ml</span>
            <span className="text-[9px] text-primary/80 font-extrabold uppercase">Garrafa</span>
          </button>
        </div>
        <div className="flex gap-2 justify-center mt-1">
          <button 
            onClick={() => onAddWater(-250)}
            className="text-[10px] font-extrabold text-rose-600 hover:underline px-3.5 py-1.5 bg-rose-50 rounded-full transition-all cursor-pointer"
          >
            Remover 250ml (Engano)
          </button>
        </div>
      </div>

      {/* Card Configurar Meta de Água */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <button 
          onClick={() => setIsSetting(!isSetting)}
          className="w-full flex justify-between items-center text-[10px] font-extrabold text-textmuted uppercase tracking-wider cursor-pointer"
        >
          <span>Ajustar Meta Diária de Água</span>
          <Settings className="w-4 h-4 text-textmuted" />
        </button>
 
        {isSetting && (
          <form onSubmit={handleUpdateGoal} className="flex gap-2 items-end mt-4">
            <div className="flex-1">
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Nova Meta de Hidratação (ml)</label>
              <input 
                type="number" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
                required
                min="500"
              />
            </div>
            <button 
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              Salvar
            </button>
          </form>
        )}
      </div>

      {/* Dica de Nutrição e Saúde */}
      <div className="bg-neutral-50 p-4 rounded-[24px] border border-neutral-100 flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-textmuted shrink-0 mt-0.5" />
        <p className="text-[11px] text-textmuted font-medium leading-relaxed">
          <strong>Por que beber água?</strong> A água atua no transporte de nutrientes, melhora a digestão, ajuda a manter a pele jovem e firme, regula a temperatura corporal e otimiza as funções metabólicas, ajudando indiretamente na perda de peso.
        </p>
      </div>

    </div>
  );
}
