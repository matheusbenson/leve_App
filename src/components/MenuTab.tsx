import React, { useState } from "react";
import { Search, Plus, Sparkles, Send, RefreshCw, ChefHat, Heart, BookOpen } from "lucide-react";
import { FoodEntry, ChatMessage, UserConfig } from "../types";

interface MenuTabProps {
  onAddFood: (name: string, kcal: number, category: string) => void;
  userProfile: UserConfig & { lastWeight: number | null };
}

// Alimentos nativos saudáveis e calorias por porção
const FOOD_DATABASE: Record<string, [string, number][]> = {
  "Café da manhã": [
    ["Pão francês (1 unid.)", 140],
    ["Pão integral de forma (2 fatias)", 110],
    ["Ovo cozido grande (1 unid.)", 75],
    ["Ovo mexido simples (2 ovos)", 170],
    ["Queijo minas frescal (fatia)", 80],
    ["Tapioca com queijo coalho (1 unid.)", 190],
    ["Mamão papaia picado (100g)", 45],
    ["Banana prata (1 unid.)", 85],
    ["Iogurte desnatado natural (1 pote)", 65],
    ["Café com leite desnatado (xícara)", 70]
  ],
  "Almoço": [
    ["Arroz branco cozido (4 colheres)", 120],
    ["Arroz integral cozido (4 colheres)", 110],
    ["Feijão carioca concha média", 80],
    ["Filé de frango grelhado (130g)", 160],
    ["Patinho bovino grelhado (100g)", 175],
    ["Filé de tilápia grelhada (120g)", 110],
    ["Salada verde temperada (azeite)", 40],
    ["Batata doce cozida (100g)", 86],
    ["Legumes cozidos no vapor (100g)", 45],
    ["Farofa simples (1 colher)", 70]
  ],
  "Lanche": [
    ["Banana média (1 unid.)", 90],
    ["Maçã gala média (1 unid.)", 70],
    ["Castanha de caju (5 unidades)", 100],
    ["Barra de cereal light", 80],
    ["Iogurte com granola (copo)", 160],
    ["Pão de queijo médio (1 unid.)", 130],
    ["Torrada integral (3 unidades)", 75],
    ["Melancia fatia média", 60]
  ],
  "Jantar": [
    ["Sopa de legumes caseira (prato)", 130],
    ["Omelete com queijo e tomate (2 ovos)", 195],
    ["Salada Caesar com frango", 220],
    ["Sanduíche natural de atum", 230],
    ["Crepioca de frango (1 unid.)", 240],
    ["Filé de peito de frango (grelhado)", 140],
    ["Sopa de feijão com macarrão", 185]
  ],
  "Bebidas": [
    ["Suco de laranja natural (copo)", 110],
    ["Suco de uva integral (copo)", 125],
    ["Água de coco verde (copo)", 40],
    ["Refrigerante Zero (lata)", 0],
    ["Chá verde sem açúcar (xícara)", 2],
    ["Cerveja Pilsen (lata)", 150]
  ]
};

export default function MenuTab({ onAddFood, userProfile }: MenuTabProps) {
  const [subTab, setSubTab] = useState<"database" | "ai">("database");
  const [selectedCat, setSelectedCat] = useState("Café da manhã");
  const [searchTerm, setSearchTerm] = useState("");
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  // Chat com Dr. Leve
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Olá! Sou o Dr. Leve, seu nutricionista inteligente pessoal. Posso te dar sugestões de refeições, tirar dúvidas de saúde, ou estruturar um cardápio semanal completo! O que gostaria de saber hoje?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const cats = Object.keys(FOOD_DATABASE);

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const kcalNum = parseInt(customKcal);
    if (!customName.trim() || isNaN(kcalNum) || kcalNum < 0) return;
    onAddFood(customName, kcalNum, selectedCat);
    setCustomName("");
    setCustomKcal("");
    alert(`${customName} adicionado ao seu diário alimentar!`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/gemini/nutritionist-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile
        })
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: "ai",
            text: data.text,
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: "Ops! Tive um problema de conexão com a central nutricional. Pode tentar repetir a pergunta por favor?",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const filteredFoods = FOOD_DATABASE[selectedCat].filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      
      {/* Botões seletores de Sub-Aba (Cardápio vs Nutricionista IA) */}
      <div className="flex p-3 bg-white border-b border-neutral-100 gap-2 shrink-0">
        <button 
          onClick={() => setSubTab("database")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-2xl transition-all ${subTab === "database" ? "bg-primary text-white shadow-md shadow-primary/10" : "bg-neutral-50 text-textmuted hover:text-textmain"}`}
        >
          <BookOpen className="w-4 h-4" /> Cardápio
        </button>
        <button 
          onClick={() => setSubTab("ai")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-2xl transition-all ${subTab === "ai" ? "bg-secondary text-white shadow-md shadow-secondary/10" : "bg-neutral-50 text-textmuted hover:text-textmain"}`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> Nutricionista IA
        </button>
      </div>

      {/* SUB-ABA CARDÁPIO */}
      {subTab === "database" ? (
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 gap-4 pb-20">
          
          {/* Caixa de Busca e Categorias */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textmuted" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar alimentos..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-brandbg border border-neutral-200/80 rounded-2xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
              />
            </div>

            {/* Categorias */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {cats.map((c) => (
                <button 
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shrink-0 transition-all border ${c === selectedCat ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-textmuted border-neutral-200 hover:border-neutral-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Alimentos Sugeridos */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100">
            <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-2">{selectedCat} Saudável</h3>
            
            <div className="flex flex-col max-h-60 overflow-y-auto">
              {filteredFoods.length > 0 ? (
                filteredFoods.map(([name, kcal]) => (
                  <div key={name} className="flex justify-between items-center py-2.5 border-b border-neutral-100/60 last:border-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-textmain truncate">{name}</h4>
                      <span className="text-[10px] text-textmuted font-extrabold">{kcal} kcal por porção</span>
                    </div>
                    <button 
                      onClick={() => {
                        onAddFood(name, kcal, selectedCat);
                        alert(`${name} adicionado ao seu diário alimentar!`);
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-full transition-all"
                      title="Adicionar ao dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-textmuted font-semibold">Nenhum alimento encontrado.</div>
              )}
            </div>
          </div>

          {/* Adicionar Personalizado */}
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100">
            <h3 className="text-[10px] font-extrabold text-textmuted uppercase tracking-wider mb-3">Registrar Personalizado</h3>
            
            <form onSubmit={handleCustomAdd} className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-extrabold text-textmuted mb-1">Nome do Alimento</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Fruta do Conde"
                    className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-textmuted mb-1">Calorias (kcal)</label>
                  <input 
                    type="number" 
                    value={customKcal}
                    onChange={(e) => setCustomKcal(e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full text-xs p-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-primary text-textmain font-medium placeholder:text-neutral-400"
                    required
                    min="0"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 mt-2 cursor-pointer"
              >
                Adicionar ao {selectedCat}
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* SUB-ABA CHAT COM IA NUTRICIONISTA */
        <div className="flex-1 flex flex-col overflow-hidden bg-brandbg relative pb-20">
          
          {/* Área de Mensagens de Conversa */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[calc(100vh-250px)] pb-24">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
              >
                <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${msg.sender === "user" ? "bg-primary text-white rounded-br-none" : "bg-white text-textmain rounded-bl-none border border-neutral-100"}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-textmuted font-extrabold mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isSending && (
              <div className="self-start flex items-center gap-1.5 p-3 bg-white border border-neutral-100 rounded-2xl rounded-bl-none text-xs text-textmuted font-medium shadow-sm">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-secondary" />
                Dr. Leve está pensando...
              </div>
            )}
          </div>

          {/* Barra de Entrada de Conversa */}
          <div className="absolute bottom-16 left-0 right-0 p-3 bg-white border-t border-neutral-100 flex gap-2 items-center z-10 shadow-lg">
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte ao nutricionista..."
                className="flex-1 text-xs px-3.5 py-2.5 bg-brandbg border border-neutral-200/80 rounded-xl focus:outline-none focus:border-secondary text-textmain font-medium placeholder:text-neutral-400"
                disabled={isSending}
              />
              <button 
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="p-2.5 bg-secondary hover:bg-secondary/90 disabled:bg-neutral-100 text-white disabled:text-neutral-400 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
