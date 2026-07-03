import React, { useState } from "react";
import { User, Calculator, Shield, Save, ArrowRight } from "lucide-react";
import { UserConfig } from "../types";

interface SettingsTabProps {
  config: UserConfig;
  lastWeight: number | null;
  onUpdateConfig: (newConfig: UserConfig) => void;
  onResetToday: () => void;
  onClearAllData: () => void;
}

export default function SettingsTab({
  config,
  lastWeight,
  onUpdateConfig,
  onResetToday,
  onClearAllData
}: SettingsTabProps) {
  const [sex, setSex] = useState<"F" | "M">(config.sex);
  const [age, setAge] = useState(config.age ? String(config.age) : "");
  const [height, setHeight] = useState(config.height ? String(config.height) : "");
  const [activity, setActivity] = useState(config.activity);
  const [calorieGoal, setCalorieGoal] = useState(String(config.calorieGoal));
  const [waterGoal, setWaterGoal] = useState(String(config.waterGoal));
  const [name, setName] = useState(config.name || "");

  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcBasal, setCalcBasal] = useState<number | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const calNum = parseInt(calorieGoal);
    const waterNum = parseInt(waterGoal);

    onUpdateConfig({
      sex,
      age: isNaN(ageNum) ? null : ageNum,
      height: isNaN(heightNum) ? null : heightNum,
      activity,
      calorieGoal: isNaN(calNum) ? 2000 : calNum,
      waterGoal: isNaN(waterNum) ? 2000 : waterNum,
      weightGoal: config.weightGoal,
      name: name.trim() || undefined
    });

    alert("Perfil de saúde atualizado com sucesso!");
  };

  const calculateMifflin = () => {
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weight = lastWeight || 70; // usa peso mais recente ou 70kg de padrão

    if (isNaN(ageNum) || iqn(heightNum) || !weight) {
      alert("Por favor, preencha os campos Idade e Altura no perfil acima para calcular.");
      return;
    }

    // Fórmula científica de Mifflin-St Jeor para TMB
    let tmb = 0;
    if (sex === "M") {
      tmb = 10 * weight + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      tmb = 10 * weight + 6.25 * heightNum - 5 * ageNum - 161;
    }

    setCalcBasal(Math.round(tmb));

    // Fator de atividade física
    const factor = parseFloat(activity);
    const maintenance = Math.round(tmb * factor);
    
    // Sugestão para emagrecimento saudável (déficit moderado de 500 kcal)
    const suggestedGoal = Math.round(maintenance - 400);
    setCalcResult(suggestedGoal);
  };

  // Helper safety check for isNaN
  function iqn(val: any) {
    return isNaN(val);
  }

  const applySuggestedGoal = () => {
    if (calcResult) {
      setCalorieGoal(String(calcResult));
      onUpdateConfig({
        ...config,
        calorieGoal: calcResult
      });
      alert(`Meta de calorias atualizada para ${calcResult} kcal!`);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-20 pt-2 select-none">
      
      {/* Formulário Dados Biológicos */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary" /> Perfil Biológico de Saúde
        </h3>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[9px] font-extrabold text-textmuted mb-1">Seu Nome</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Antônia"
              className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Gênero Biológico</label>
              <select 
                value={sex} 
                onChange={(e) => setSex(e.target.value as "F" | "M")}
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-bold"
              >
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Idade (anos)</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 28"
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
                required
                min="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Altura (cm)</label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Ex: 165"
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
                required
                min="100"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Nível de Atividade</label>
              <select 
                value={activity} 
                onChange={(e) => setActivity(e.target.value)}
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-bold"
              >
                <option value="1.2">Sedentário (Sem exercícios)</option>
                <option value="1.375">Leve (1-3 dias/semana)</option>
                <option value="1.55">Moderado (3-5 dias/semana)</option>
                <option value="1.725">Intenso (6-7 dias/semana)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3.5">
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Meta de Calorias (kcal)</label>
              <input 
                type="number" 
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-bold"
                required
                min="800"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-textmuted mb-1">Meta de Água (ml)</label>
              <input 
                type="number" 
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-bold"
                required
                min="500"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1 mt-1 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Salvar Perfil
          </button>
        </form>
      </div>

      {/* Calculadora Mifflin de Metas */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-3">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-secondary" />
          Calculadora de Gasto Energético
        </h3>
        <p className="text-[10px] text-textmuted font-medium">
          Descubra de forma científica a quantidade de energia que seu corpo gasta baseado na fórmula de Mifflin-St Jeor e o peso registrado de {lastWeight || 70} kg.
        </p>
        
        <button 
          onClick={calculateMifflin}
          className="w-full bg-brandbg hover:bg-neutral-100 text-textmain text-xs py-2.5 rounded-xl font-bold transition-all border border-neutral-200 cursor-pointer"
        >
          Calcular Minhas Necessidades
        </button>

        {calcBasal && calcResult && (
          <div className="mt-2 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50 flex flex-col gap-2.5 text-xs text-textmain">
            <div className="flex justify-between font-bold">
              <span className="text-textmuted">Taxa Metabólica Basal (TMB):</span>
              <span className="text-textmain font-extrabold">{calcBasal} kcal</span>
            </div>
            <div className="flex justify-between font-bold border-t border-neutral-100/70 pt-2 text-indigo-900">
              <span className="text-primary font-extrabold">Sugestão Diária para Emagrecer:</span>
              <span className="font-black text-primary text-sm">{calcResult} kcal</span>
            </div>
            <button 
              onClick={applySuggestedGoal}
              className="mt-2 bg-secondary hover:bg-secondary/95 text-white text-[10px] font-extrabold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm shadow-secondary/10 cursor-pointer"
            >
              Aplicar {calcResult} kcal como minha meta <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Backup e Limpeza de Dados */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-neutral-100">
        <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-rose-500" /> Segurança e Dados Offline
        </h3>

        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-neutral-100/60">
            <div>
              <h4 className="font-bold text-textmain">Limpar Diário Alimentar</h4>
              <p className="text-[9px] text-textmuted">Remove todos os alimentos salvos apenas no dia de hoje.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm("Deseja realmente limpar todos os alimentos e água salvos hoje?")) {
                  onResetToday();
                  alert("Dados de hoje redefinidos!");
                }
              }}
              className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl border border-rose-200/50 font-extrabold text-[10px] transition-colors cursor-pointer"
            >
              Limpar Hoje
            </button>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <h4 className="font-bold text-textmain">Redefinir Tudo</h4>
              <p className="text-[9px] text-textmuted">Limpa todo o histórico de peso, perfil e alimentos do aparelho.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm("ATENÇÃO: Isso apagará absolutamente todo o seu histórico no app de forma irreversível. Deseja redefinir o aplicativo?")) {
                  onClearAllData();
                  alert("Aplicativo redefinido com sucesso para as configurações originais!");
                }
              }}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-extrabold text-[10px] transition-colors cursor-pointer"
            >
              Redefinir App
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé explicativo */}
      <div className="text-center text-[10px] text-textmuted leading-relaxed py-2 flex flex-col gap-0.5 font-bold">
        <span>Leve - Versão Mobile Oficial 1.0.0</span>
        <span>Projeto pronto para empacotamento com Capacitor</span>
      </div>

    </div>
  );
}
