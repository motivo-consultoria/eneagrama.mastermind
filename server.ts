import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { ENNEAGRAM_TYPES, PILLARS } from "./src/data/enneagramData.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Endpoint to directly receive and save the exact logo image from UI
import fs from "fs";
app.post("/api/upload-logo", (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Nenhuma imagem fornecida." });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const publicPath = path.join(process.cwd(), "public", "mastermind-logo.png");
    
    fs.writeFileSync(publicPath, buffer);
    console.log("Logo original gravada com sucesso em:", publicPath);
    return res.json({ success: true, path: "/mastermind-logo.png" });
  } catch (err: any) {
    console.error("Erro ao gravar logo:", err);
    return res.status(500).json({ error: "Erro ao gravar logo." });
  }
});

// Endpoint to receive and save the custom Napoleon Hill avatar image
app.post("/api/upload-avatar", (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Nenhuma imagem fornecida." });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const publicPath = path.join(process.cwd(), "public", "napoleon-hill-custom.png");
    
    fs.writeFileSync(publicPath, buffer);
    console.log("Avatar original de Napoleon Hill gravado com sucesso em:", publicPath);
    return res.json({ success: true, path: "/napoleon-hill-custom.png" });
  } catch (err: any) {
    console.error("Erro ao gravar avatar:", err);
    return res.status(500).json({ error: "Erro ao gravar avatar." });
  }
});

// Lazy-initialized Gemini client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `
Você é Napoleon Hill, mentor de alta performance e liderança da Fundação Napoleon Hill (MasterMind), integrando os ensinamentos da Lei do Triunfo, atitude mental positiva e o Eneagrama Sistêmico Vitruviano.

SEU PAPEL E DIRETRIZES FUNDAMENTAIS:
1. Identidade & Tom de voz: Fale como Napoleon Hill — sábio, magnânimo, prático, encorajador, focado em autodomínio, leis do sucesso e inteligência emocional.
2. Interação Passo a Passo (Uma pergunta por vez):
   - Não sobrecarregue o usuário com múltiplas perguntas simultâneas.
   - Conduza a mentoria passo a passo de forma organizada.
   - Quando o usuário informar o seu próprio padrão, acolha com sabedoria e, se for o caso do Pilar de Feedback, pergunte em seguida apenas qual é o padrão do liderado ou da outra pessoa envolvida.
   - Quando tiver os padrões, peça então o relato da situação específica para formular a diretriz cirúrgica.
3. Lembrete crucial: No MasterMind, o líder "NÃO É, ele SE ENCONTRA em um determinado padrão". A mudança de padrão é alcançada pelo despertar da Virtude e superação do Vício Emocional (Paixão Cega).
4. Base teórica dos 9 Padrões Master do Eneagrama:
   - Padrão 1 (Perfeccionista / Ética e Perfeição): Virtude: Serenidade e Sabedoria. Vício: Raiva/Ira reprimida (Ressentimento). Ferida: Traição/Imperfeição.
   - Padrão 2 (Auxiliador / Amor e Ajuda): Virtude: Humildade e Amor Incondicional (Autocuidado). Vício: Orgulho. Ferida: Não merecer ser amado.
   - Padrão 3 (Realizador / Desempenho e Sucesso): Virtude: Autenticidade e Verdade. Vício: Vaidade (Autoengano). Ferida: Fracassar/Ser rejeitado.
   - Padrão 4 (Idealista, Intenso, Profundo / Originalidade): Virtude: Equanimidade. Vício: Inveja (Sensação de falta). Ferida: Perda/Abandono.
   - Padrão 5 (Observador / Sabedoria): Virtude: Desprendimento e Engajamento. Vício: Avareza (Retenção). Ferida: Desconfiança/Invasão.
   - Padrão 6 (Cético Leal / Lealdade e Segurança): Virtude: Coragem e Autonomia. Vício: Medo/Ansiedade. Ferida: Sentir-se desprotegido.
   - Padrão 7 (Entusiasta / Otimismo e Prazer): Virtude: Sobriedade, Temperança e Foco. Vício: Gula (Dispersão). Ferida: Sofrimento/Limitação.
   - Padrão 8 (Contestador / Proteção e Justiça): Virtude: Inocência e Magnanimidade (Verdadeira Força). Vício: Luxúria (Excesso de controle/imposição). Ferida: Perda do comando/Vulnerabilidade.
   - Padrão 9 (Mediador / Paz e União): Virtude: Ação Correta, Diligência e Posicionamento. Vício: Indolência/Preguiça psicológica. Ferida: Perder a referência/Separação.

DIRETRIZES POR PILAR:
- Pilar 1 (Assistente de Feedback Estratégico):
  Ajude a conduzir conversas difíceis. Conduza de forma sequencial (seu padrão -> padrão do liderado -> contexto do feedback).
  Ao ter todas as informações:
  * Indique a dinâmica relacional entre os dois padrões.
  * Forneça as palavras exatas e gatilhos de confiança a utilizar.
  * Destaque quais gatilhos emocionais EVITAR para não acionar a defesa do liderado.
  * Estruture um roteiro executivo de 3 passos para a conversa.

- Pilar 2 (SOS Inteligência Emocional / Auto-gestão):
  Resgate o equilíbrio emocional diante de crises. Ao receber o padrão e a situação:
  * Identifique claramente o Vício Emocional do líder que foi ativado sob estresse.
  * Ofereça exatamente 2 ações práticas e imediatas para resgatar a Virtude correspondente e retomar o domínio próprio.

- Pilar 3 (Bússola Diária de Virtudes):
  Foque a energia nas maiores forças para o dia. Ao receber o eneatipo e o desafio do dia:
  * Entregue uma "Pílula de Sabedoria Napoleon Hill" conectando o desafio à virtude mestra do padrão.
  * Proponha um "Desafio Prático de Liderança de 24h" mensurável e aplicável.

Sempre responda em Português do Brasil com excelente formatação em Markdown (negritos, tópicos organizados).
`;

// Helper for local fallback mentorship when API key is not configured
function generateLocalMentorResponse(pillarId: string, messages: Array<{ role: string; content: string }>): string {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lastUserMsgLower = lastUserMsg.toLowerCase();

  // Try to detect Enneatype numbers in message
  const matchLeaderType = lastUserMsg.match(/\b([1-9])\b/) || lastUserMsg.match(/tipo\s*([1-9])/i) || lastUserMsg.match(/eneatipo\s*([1-9])/i);
  const detectedTypeNum = matchLeaderType ? parseInt(matchLeaderType[1], 10) : null;
  const detectedInfo = detectedTypeNum && ENNEAGRAM_TYPES[detectedTypeNum] ? ENNEAGRAM_TYPES[detectedTypeNum] : null;

  if (pillarId === "feedback") {
    if (detectedInfo) {
      return `### 🎯 Diagnóstico Estratégico MasterMind

**Seu Padrão:** Tipo ${detectedInfo.id} (${detectedInfo.name} - ${detectedInfo.subtitle})
**Virtude a Manifestar:** ${detectedInfo.virtue}

---

#### 1. Dinâmica da Conversa & Pontos de Atenção
* **Postura Recomendada:** ${detectedInfo.feedbackAdviceAsLeader}
* **Gatilhos a EVITAR:** ${detectedInfo.communicationTriggersToAvoid.join("; ")}.

#### 2. Roteiro Executivo de Feedback
1. **Abertura de Confiança:** Inicie reconhecendo a intenção positiva e o alinhamento com o objetivo comum do time.
2. **Fatos Objetivos:** Apresente o impacto da situação sem rotular ou julgar o caráter do liderado.
3. **Pacto de Ação:** Convide o liderado para cocriar a solução com um compromisso claro e data de alinhamento.

> *"O autêntico líder MasterMind não impõe pelo medo, mas alinha propósitos pela clareza e respeito mútuo."*

Gostaria de refinar as palavras exatas para uma frase específica de abertura?`;
    }

    return `### 🎯 Assistente de Feedback Estratégico

Entendido. Para calibrarmos a abordagem com precisão cirúrgica:

1. **Qual é o seu Eneatipo** (ou o padrão em que você mais se reconhece)?
2. **Qual é o Eneatipo provável do seu liderado?**
3. **Qual é a situação concreta** que necessita de alinhamento?

*Com essas informações, estruturarei o roteiro de palavras exatas e os gatilhos a evitar.*`;
  }

  if (pillarId === "sos") {
    if (detectedInfo) {
      return `### 🛡️ SOS Inteligência Emocional MasterMind

**Padrão Ativado:** Tipo ${detectedInfo.id} (${detectedInfo.name})
**Vício Emocional Sob Estresse:** **${detectedInfo.emotionalVice}**
**Virtude Mestra a Resgatar:** **${detectedInfo.virtue}**

---

#### 🚨 2 Ações Práticas Imediatas:
1. **${detectedInfo.sosActions[0]}**
2. **${detectedInfo.sosActions[1]}**

---

#### 💡 Atitude de Cura Mental:
> *"${detectedInfo.healingAttitude}"*

**Respiração de Transição:** Inspire em 4 tempos, retenha o ar por 2 tempos e solte em 6 tempos, reconectando-se com a sua essência antes de qualquer decisão.

Como você está se sentindo agora para dar o próximo passo?`;
    }

    return `### 🛡️ SOS Inteligência Emocional

Respire fundo. O primeiro passo da liderança de alta performance é o autodomínio.

Por favor, me diga:
- **Qual é o seu Eneatipo (1 a 9)?**
- **O que aconteceu especificamente que está gerando esse pico de estresse ou tirando você do eixo?**

*Vou identificar o vício emocional ativado e te entregar 2 ações práticas imediatas para resgatar sua virtude.*`;
  }

  // Pillar 3: Bussola
  if (detectedInfo) {
    return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão ${detectedInfo.id}:** ${detectedInfo.name}
**Virtude Farol do Dia:** **${detectedInfo.virtue}**

---

#### 📜 Pílula de Sabedoria MasterMind:
> *"${detectedInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança (Próximas 24h):
* **Missão:** ${detectedInfo.turningPoint}
* **Ação Concreta:** Identifique hoje uma oportunidade com a sua equipe onde você colocará em prática a virtude de **${detectedInfo.virtue}**, evitando cair na armadilha da fixação de *${detectedInfo.mentalFixation}*.

Qual é o primeiro momento do seu dia onde você aplicará esse desafio?`;
  }

  return `### 🧭 Bússola Diária de Virtudes

Excelente iniciativa para direcionar sua energia com intencionalidade.

Para desenhar sua bússola diária:
1. **Qual é o seu Eneatipo (1 a 9)?**
2. **Qual é o seu principal desafio ou decisão estratégica de hoje?**

*Entregarei uma pílula de sabedoria sob medida e seu desafio de liderança de 24 horas.*`;
}

// API Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { pillarId, messages } = req.body;
    const ai = getAI();

    if (!ai) {
      // Use rich deterministic MasterMind logic
      const fallbackResponse = generateLocalMentorResponse(pillarId, messages);
      return res.json({ text: fallbackResponse });
    }

    const pillar = PILLARS[pillarId] || PILLARS.feedback;

    // Build conversation contents for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nPILAR ATUAL: ${pillar.badge} - ${pillar.title}\nCONTEXTO: ${pillar.description}`,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "Não foi possível gerar a resposta no momento.";
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    // Graceful fallback to rich local logic on error
    const fallbackResponse = generateLocalMentorResponse(req.body?.pillarId || "feedback", req.body?.messages || []);
    return res.json({ text: fallbackResponse });
  }
});

// API Summary Endpoint for Session Card Export
app.post("/api/summary", async (req, res) => {
  try {
    const { pillarId, messages, enneatypesDetected } = req.body;
    const ai = getAI();

    const pillar = PILLARS[pillarId] || PILLARS.feedback;
    const conversationText = (messages || [])
      .map((m: { role: string; content: string }) => `${m.role === "assistant" ? "Mentor" : "Líder"}: ${m.content}`)
      .join("\n\n");

    if (!ai) {
      // Return structured default summary
      return res.json({
        title: pillar.title,
        enneatypeText: enneatypesDetected || "Eneagrama Sistêmico",
        keyLearnings: [
          "Identificação do padrão comportamental e conscientização dos gatilhos de estresse.",
          "Transição deliberada do vício emocional para o acesso à virtude mestra de liderança.",
          "Plano de ação executivo com foco em comunicação não-reativa e alinhamento de equipe.",
          "Compromisso de aplicação prática nas próximas 24 horas sob a metodologia MasterMind."
        ],
        quote: "Você não é o seu padrão, você se encontra nele. A verdadeira liderança nasce da virtude."
      });
    }

    const summaryPrompt = `Analise a seguinte sessão de mentoria de liderança do pilar "${pillar.title}".
Gere um JSON com o seguinte formato exato:
{
  "title": "${pillar.title}",
  "enneatypeText": "Eneatipo(s) trabalhado(s) ou síntese do foco",
  "keyLearnings": [
    "Aprendizado 1 em 1 frase curta e impactante",
    "Aprendizado 2 em 1 frase curta e impactante",
    "Aprendizado 3 em 1 frase curta e impactante",
    "Aprendizado 4 em 1 frase curta e impactante"
  ],
  "quote": "Uma frase marcante de liderança MasterMind/Napoleon Hill para reflexão"
}

CONVERSA:
${conversationText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: summaryPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const jsonText = response.text?.trim() || "{}";
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error in /api/summary:", error);
    const pillar = PILLARS[req.body?.pillarId] || PILLARS.feedback;
    return res.json({
      title: pillar.title,
      enneatypeText: req.body?.enneatypesDetected || "Eneagrama Sistêmico",
      keyLearnings: [
        "Reconhecimento do padrão emocional ativado na situação.",
        "Acesso à virtude correspondente para restaurar o autodomínio.",
        "Estratégia prática de comunicação e liderança de alta performance.",
        "Aplicação contínua da filosofia MasterMind no cotidiano executivo."
      ],
      quote: "O autoconhecimento é o alicerce indispensável para a maestria na liderança."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mentor MasterMind Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
