import React, { useState } from "react";
import { Scale, TrendingDown, TrendingUp, Award, Calendar } from "lucide-react";
import { WeightEntry, UserConfig } from "../types";

interface WeightTabProps {
  weights: WeightEntry[];
  weightGoal: number | null;
  height: number | null;
  onLogWeight: (w: number) => void;
  onUpdateWeightGoal: (goal: number) => void;
}

export default function WeightTab({
  weights,
  weightGoal,
  height,
  onLogWeight,
  onUpdateWeightGoal
}: WeightTabProps) {
  const [weightInput, setWeightInput] = useState("");
  const [goalInput, setGoalInput] = useState(weightGoal ? String(weightGoal) : "");

  const lastWeight = weights.length > 0 ? weights[weights.length - 1].w : null;
  const firstWeight = weights.length > 0 ? weights[0].w : null;

  // Cálculo de IMC
  const heightInMeters = height ? height / 100 : null;
  const imc = (lastWeight && heightInMeters) ? Number((lastWeight / (heightInMeters * heightInMeters)).toFixed(1)) : null;

  let imcCategory = "";
  let imcColor = "text-textmuted";
  let imcBg = "bg-neutral-50";
  
  if (imc) {
    if (imc < 18.5) {
      imcCategory = "Abaixo do peso";
      imcColor = "text-blue-600";
      imcBg = "bg-blue-50";
    } else if (imc < 24.9) {
      imcCategory = "Peso ideal (Saudável) ✨";
      imcColor = "text-indigo-600";
      imcBg = "bg-indigo-50/70";
    } else if (imc < 29.9) {
      imcCategory = "Sobrepeso";
      imcColor = "text-pink-600";
      imcBg = "bg-pink-50";
    } else {
      imcCategory = "Obesidade ⚠️";
      imcColor = "text-rose-600";
      imcBg = "bg-rose-50";
    }
  }

  // Diferença em relação ao peso inicial e objetivo
  const weightDiff = (lastWeight && firstWeight) ? Number((lastWeight - firstWeight).toFixed(1)) : null;
  const remainingToGoal = (lastWeight && weightGoal) ? Number((lastWeight - weightGoal).toFixed(1)) : null;

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      onLogWeight(w);
      setWeightInput("");
      alert("Peso registrado com sucesso!");
    }
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(goalInput);
    if (!isNaN(g) && g > 0) {
      onUpdateWeightGoal(g);
      alert("Meta de peso atualizada com sucesso!");
    }
  };

  // Renderizar gráfico de evolução SVG
  const renderChart = () => {
    if (weights.length < 2) {
      return (
        <div className="text-center py-12 text-xs text-textmuted font-semibold leading-relaxed">
          Registre seu peso pelo menos 2 vezes para gerar o gráfico de evolução física!
        </div>
      );
    }

    const maxW = Math.max(...weights.map(w => w.w));
    const minW = Math.min(...weights.map(w => w.w));
    const range = Math.max(maxW - minW, 1);
    
    // Configurações do SVG
    const width = 310;
    const heightSvg = 120;
    const padding = 20;

    const points = weights.map((w, index) => {
      const x = padding + (index / (weights.length - 1)) * (width - 2 * padding);
      const y = heightSvg - padding - ((w.w - minW) / range) * (heightSvg - 2 * padding);
      return { x, y, w: w.w, date: w.date };
    });

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div className="w-full overflow-x-auto py-2">
        <svg width={width} height={heightSvg} className="mx-auto overflow-visible">
          {/* Linhas de Grade de Fundo sutil */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(0,0,0,0.06)" strokeDasharray="3,3" />
          <line x1={padding} y1={heightSvg / 2} x2={width - padding} y2={heightSvg / 2} stroke="rgba(0,0,0,0.06)" strokeDasharray="3,3" />
          <line x1={padding} y1={heightSvg - padding} x2={width - padding} y2={heightSvg - padding} stroke="rgba(0,0,0,0.06)" strokeDasharray="3,3" />

          {/* Linha da Meta se aplicável */}
          {weightGoal && weightGoal >= minW && weightGoal <= maxW && (
            <line 
              x1={padding} 
              y1={heightSvg - padding - ((weightGoal - minW) / range) * (heightSvg - 2 * padding)} 
              x2={width - padding} 
              y2={heightSvg - padding - ((weightGoal - minW) / range) * (heightSvg - 2 * padding)} 
              stroke="#ec4899" 
              strokeWidth="1.5" 
              strokeDasharray="4,4" 
            />
          )}

          {/* Linha do Gráfico */}
          <path d={path} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Pontos do Gráfico com labels */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4.5" fill="#6366f1" stroke="#FFFFFF" strokeWidth="2" className="cursor-pointer" />
              {/* Exibe o peso no último e primeiro ponto por simplicidade */}
              {(i === 0 || i === points.length - 1) && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] font-extrabold fill-slate-800 font-sans">
                  {p.w}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-20 pt-2 select-none">
      
      {/* Formulário Duplo de Lançamento */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-primary" /> Registrar Peso e Meta
        </h3>

        <form onSubmit={handleLog} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[9px] font-extrabold text-textmuted mb-1">Peso Atual (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Ex: 75.3"
              className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
              required
              min="20"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              Registrar
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdateGoal} className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3">
          <div>
            <label className="block text-[9px] font-extrabold text-textmuted mb-1">Meta de Peso (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Ex: 70.0"
              className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
              required
              min="20"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/95 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-secondary/10 cursor-pointer"
            >
              Definir Objetivo
            </button>
          </div>
        </form>
      </div>

      {/* Card Evolução Física */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-2">Histórico de Curva Física</h3>
        {renderChart()}
      </div>

      {/* IMC Card */}
      {imc && (
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider">Análise de IMC</h3>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-black text-textmain font-sans leading-none">{imc}</span>
              <span className="text-xs text-textmuted font-semibold ml-1">kg/m²</span>
            </div>
            <span className={`text-[10px] uppercase font-extrabold px-3.5 py-1 rounded-full ${imcBg} ${imcColor} border border-current/10`}>
              {imcCategory}
            </span>
          </div>

          {/* Barra de Classificação Visual IMC */}
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden flex">
            <div className="flex-1 bg-blue-300" title="Abaixo do peso"></div>
            <div className="flex-1 bg-green-400" title="Ideal"></div>
            <div className="flex-1 bg-amber-400" title="Sobrepeso"></div>
            <div className="flex-1 bg-red-400" title="Obesidade"></div>
          </div>
          <p className="text-[10px] text-textmuted font-medium italic">Seu Índice de Massa Corporal baseia-se na altura de {height}cm e peso de {lastWeight}kg.</p>
        </div>
      )}

      {/* Estatísticas e Resultados Rápidos */}
      {lastWeight && (
        <div className="grid grid-cols-2 gap-3">
          {weightDiff !== null && (
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-1">Evolução Geral</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {weightDiff < 0 ? (
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-[14px]">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                ) : weightDiff > 0 ? (
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-[14px]">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-2 bg-brandbg text-textmuted rounded-[14px]">
                    <Scale className="w-4 h-4" />
                  </span>
                )}
                <span className="text-lg font-black text-textmain font-sans">{weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg</span>
              </div>
            </div>
          )}

          {remainingToGoal !== null && (
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-1">Falta para Meta</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="p-2 bg-pink-50 text-secondary rounded-[14px]">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-lg font-black text-textmain font-sans">
                  {remainingToGoal > 0 ? `${remainingToGoal} kg` : remainingToGoal === 0 ? "Atingida!" : `${Math.abs(remainingToGoal)} kg (Abaixo!)`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico das Pesagens em Lista */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-2.5">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-1.5">Histórico de Pesagem</h3>
        
        {weights.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {[...weights].reverse().slice(0, 10).map((w) => (
              <div key={w.id} className="flex justify-between items-center py-2.5 border-b border-neutral-100 last:border-0 text-xs">
                <span className="text-textmuted font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-textmuted" />
                  {new Date(w.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                </span>
                <span className="font-black text-textmain font-sans">{w.w} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-textmuted font-semibold">Nenhum registro de peso feito ainda.</div>
        )}
      </div>

    </div>
  );
}
