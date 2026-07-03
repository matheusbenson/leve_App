import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicialização segura do Gemini
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY não encontrada no ambiente. Recursos de IA funcionarão em modo simulação offline.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Função utilitária para tentar novamente requisições do Gemini caso o servidor esteja temporariamente indisponível ou em alta demanda (erros 503 ou 429)
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || error?.code || 0;
    const errorMessage = error?.message || "";
    const isRateLimitOrUnavailable = 
      status === 429 || 
      status === 503 || 
      errorMessage.includes("503") || 
      errorMessage.includes("429") || 
      errorMessage.toLowerCase().includes("high demand") || 
      errorMessage.toLowerCase().includes("unavailable") ||
      errorMessage.toLowerCase().includes("temporary");
    
    if (retries > 0 && isRateLimitOrUnavailable) {
      console.warn(`[Gemini Retry] Erro transiente de alta demanda (${status || "503"}). Re-tentando em ${delay}ms... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ================= ROTAS DE API DO GEMINI =================

// 1. Analisar alimentação em texto livre (ex: "comi 2 ovos fritos, um pão francês e um copo de suco de uva")
app.post("/api/gemini/analyze-food", async (req, res) => {
  const { text, category } = req.body;
  if (!text) {
    return res.status(400).json({ error: "O texto da refeição é obrigatório." });
  }

  const ai = getGeminiClient();
  const catLabel = category || "Refeição";

  if (!ai) {
    // Modo simulação se a chave do Gemini não estiver configurada
    console.log("Simulando análise de alimento (sem chave de API)...");
    const simulatedResponse = [
      { name: "Alimento identificado 1", kcal: 180, portion: "1 porção média" },
      { name: "Alimento identificado 2", kcal: 120, portion: "100g" }
    ];
    // Se o usuário digitou coisas específicas, vamos tentar fazer uma simulação simples
    const lower = text.toLowerCase();
    if (lower.includes("ovo")) {
      simulatedResponse[0] = { name: "Ovo frito/mexido", kcal: 90, portion: "1 unidade" };
    }
    if (lower.includes("pão") || lower.includes("pao")) {
      simulatedResponse[1] = { name: "Pão francês", kcal: 140, portion: "1 unidade (50g)" };
    }
    if (lower.includes("maçã") || lower.includes("maca")) {
      simulatedResponse[0] = { name: "Maçã vermelha", kcal: 60, portion: "1 unidade" };
    }
    if (lower.includes("arroz")) {
      simulatedResponse[0] = { name: "Arroz cozido", kcal: 130, portion: "4 colheres de sopa" };
    }
    if (lower.includes("feijão") || lower.includes("feijao")) {
      simulatedResponse[1] = { name: "Feijão carioca cozido", kcal: 80, portion: "1 concha média" };
    }
    return res.json({ foods: simulatedResponse, isSimulated: true });
  }

  try {
    const prompt = `Analise o seguinte relato de refeição consumida na categoria "${catLabel}" e decomponha-o em alimentos específicos, estimando a quantidade calórica de cada um em kcal. 
Relato do usuário: "${text}"

Retorne uma lista estruturada de alimentos identificados, suas calorias e a porção considerada.`;

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um especialista em nutrição e saúde de alto nível. Seu objetivo é estimar com a maior precisão possível as calorias (kcal) e porções de relatos informais de refeições feitas por brasileiros. Seja preciso e realista com os valores médios de tabelas nutricionais nacionais (como a TACO).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foods: {
              type: Type.ARRAY,
              description: "Lista de alimentos identificados na refeição do usuário com as suas calorias e porções estimadas.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome em português do alimento específico identificado (ex: Pão francês, Ovo frito, Café com açúcar)." },
                  kcal: { type: Type.INTEGER, description: "Quantidade de calorias estimada em kcal para a porção do alimento." },
                  portion: { type: Type.STRING, description: "A porção aproximada considerada com base no texto do usuário (ex: 2 unidades, 1 fatia de 30g, 1 copo de 200ml, 1 prato cheio)." }
                },
                required: ["name", "kcal", "portion"]
              }
            }
          },
          required: ["foods"]
        }
      }
    }));

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta do Gemini vazia.");
    }

    const data = JSON.parse(resultText);
    res.json({ foods: data.foods, isSimulated: false });
  } catch (error: any) {
    console.error("Erro na rota /api/gemini/analyze-food:", error);
    res.status(500).json({ error: "Erro ao processar refeição com a IA.", details: error.message });
  }
});

// 2. Nutricionista IA (Conversa inteligente sobre saúde, dieta, etc.)
app.post("/api/gemini/nutritionist-chat", async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Lista de mensagens é obrigatória." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("Simulando chat de Nutricionista IA (sem chave de API)...");
    const lastMsg = messages[messages.length - 1]?.text || "";
    let reply = "Olá! Desculpe, estou em modo de simulação porque a chave de API do Gemini não foi configurada. No entanto, posso dizer que manter um diário de calorias e beber bastante água são ótimos hábitos para a saúde! Como posso te ajudar hoje?";
    
    if (lastMsg.toLowerCase().includes("caloria") || lastMsg.toLowerCase().includes("meta")) {
      reply = "Para emagrecer de forma saudável, um déficit calórico moderado de 300 a 500 kcal diárias em relação ao seu gasto energético total é o recomendado. Beber pelo menos 35ml de água por quilo de peso também otimiza muito o seu metabolismo!";
    } else if (lastMsg.toLowerCase().includes("receita") || lastMsg.toLowerCase().includes("comer")) {
      reply = "Uma excelente opção de lanche saudável e rápido é uma crepioca (1 ovo batido com 1 colher de sopa de goma de tapioca, recheada com queijo minas) acompanhada de uma xícara de café com leite desnatado ou chá de hibisco!";
    }
    
    return res.json({ text: reply, isSimulated: true });
  }

  try {
    // Preparar o perfil do usuário para dar contexto à IA
    const profileText = userProfile 
      ? `\n\nPerfil do Usuário Atual:\n- Sexo: ${userProfile.sex === 'M' ? 'Masculino' : 'Feminino'}\n- Idade: ${userProfile.age || 'Não informada'}\n- Altura: ${userProfile.height ? userProfile.height + ' cm' : 'Não informada'}\n- Meta de Calorias: ${userProfile.calorieGoal} kcal/dia\n- Meta de Água: ${userProfile.waterGoal} ml/dia\n- Meta de Peso: ${userProfile.weightGoal ? userProfile.weightGoal + ' kg' : 'Não informada'}`
      : "";

    // Formatar histórico para o Gemini
    // Usaremos generateContent enviando o histórico formatado como texto simples ou usando chat do SDK.
    // Vamos usar o chat do SDK
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `Você é o Dr. Leve, um nutricionista virtual e coach de saúde inteligente altamente qualificado, empático e prático. Sua missão é ajudar o usuário a alcançar seus objetivos de saúde (emagrecimento, ganho de massa, reeducação alimentar) com conversas motivadoras, cardápios realistas e conselhos cientificamente fundamentados. 
Evite termos técnicos excessivamente complexos e jargões corporativos. Seja amigável, direto, acolhedor e focado no estilo de vida do brasileiro. Use analogias simples e sugestões de alimentos fáceis de encontrar em qualquer mercado no Brasil.${profileText}`
      }
    });

    // Enviar as mensagens anteriores, exceto a última, para construir o histórico
    // Para simplificar, podemos enviar apenas as últimas mensagens formatadas no chat ou enviar diretamente no prompt consolidado
    // O chat.sendMessage() aceita mensagens em sequência.
    // Para evitar overhead, vamos pegar as últimas 6 mensagens e processar.
    const lastMessageObj = messages[messages.length - 1];
    
    // Podemos recriar o histórico enviando mensagens anteriores uma a uma se houver, ou consolidar o histórico em um único prompt de contexto rico:
    const historyPrompt = messages.map((m: any) => `${m.sender === 'user' ? 'Usuário' : 'Dr. Leve'}: ${m.text}`).join("\n");
    const fullPrompt = `${historyPrompt}\n\nResponda ao usuário como Dr. Leve da forma mais prestativa e gentil possível.`;

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: `Você é o Dr. Leve, um nutricionista virtual e coach de saúde inteligente altamente qualificado, empático e prático. Sua missão é ajudar o usuário a alcançar seus objetivos de saúde (emagrecimento, ganho de massa, reeducação alimentar) com conversas motivadoras, cardápios realistas e conselhos cientificamente fundamentados. Use analogias simples e sugestões de alimentos fáceis de encontrar em qualquer mercado no Brasil.${profileText}`
      }
    }));

    res.json({ text: response.text, isSimulated: false });
  } catch (error: any) {
    console.error("Erro na rota /api/gemini/nutritionist-chat:", error);
    res.status(500).json({ error: "Erro ao processar conversa com a IA.", details: error.message });
  }
});


// 3. Gerador de Dicas de Saúde rápidas (exibidas na dashboard)
app.get("/api/gemini/health-tip", async (req, res) => {
  const tips = [
    "Beba água! Beber 1 copo de água a cada 2 horas ajuda a manter o metabolismo ativo. 💧",
    "Planeje suas refeições com antecedência para evitar opções ultraprocessadas na hora da fome. 🍎",
    "As fibras do pão integral prolongam a sensação de saciedade e ajudam a controlar os picos de insulina. 🍞",
    "Dormir de 7 a 8 horas por noite regula os hormônios da fome (grelina e leptina) e facilita a queima de gordura. 😴",
    "Substituir o açúcar refinado por frutas picadas em iogurtes ajuda a diminuir os desejos por doces de forma natural. 🍓",
    "Consumir uma fonte de proteína magra no café da manhã ajuda a controlar o apetite ao longo do dia. 🍳",
    "Mastigar devagar dá tempo para que os hormônios da saciedade cheguem ao cérebro (cerca de 20 minutos). 🕒",
    "Evite distrações como celular ou TV enquanto come para ter mais consciência da porção consumida. 📱",
    "Adicionar sementes de chia ou linhaça nas frutas ajuda a reduzir a velocidade de absorção da glicose. 🌾",
    "O chá verde e o gengibre possuem propriedades termogênicas leves que auxiliam o metabolismo. 🍵",
    "Fazer pequenos intervalos para alongar ou caminhar durante o dia melhora a circulação e queima calorias passivas. 🚶",
    "Prefira temperos naturais como alho, cebola, orégano e limão para reduzir o consumo de sódio e inchaço. 🌿",
    "O consumo de gorduras boas (como abacate, nozes e azeite) é essencial para a regulação hormonal saudável. 🥑",
    "Evite calorias líquidas: sucos coados e refrigerantes têm rápida absorção e dão pouca saciedade. 🥤",
    "Foque em consistência, não em perfeição. Um deslize em uma refeição não anula todo o seu esforço semanal! ✨",
    "Faça da caminhada diária o seu momento de descompressão mental e saúde cardiovascular. 👟",
    "O ovo é uma fonte de proteína completa e barata, excelente para manutenção de massa muscular magra. 🥚",
    "Faça exames de sangue periódicos: vitaminas e minerais em dia garantem um metabolismo muito mais eficiente. 🩸",
    "Não confie apenas na balança. Medidas físicas e o caimento das roupas mostram sua verdadeira recomposição corporal! 📏",
    "Água gelada queima calorias sutilmente, pois o corpo precisa gastar energia para aquecê-la até a temperatura corporal. ❄️"
  ];

  const ai = getGeminiClient();

  if (!ai) {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return res.json({ tip: randomTip, isSimulated: true });
  }

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Gere uma dica de saúde, nutrição ou bem-estar ultra curta, prática e motivadora (máximo 150 caracteres) para ser exibida no painel de um aplicativo de controle de calorias. Escreva em português brasileiro de forma direta e inspiradora.",
      config: {
        temperature: 0.8
      }
    }));

    res.json({ tip: response.text?.trim() || tips[Math.floor(Math.random() * tips.length)], isSimulated: false });
  } catch (error: any) {
    console.error("Erro na rota /api/gemini/health-tip após retentativas:", error);
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json({ tip: randomTip, isSimulated: true });
  }
});

// ================= SETUP DO SERVER E VITE MIDDLEWARE =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Leve Server] Rodando na porta http://localhost:${PORT}`);
  });
}

startServer();
