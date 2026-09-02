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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

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

// Helper for local fallback mentorship when API key is not configured or hits limits
function generateLocalMentorResponse(
  pillarId: string,
  messages: Array<{ role: string; content: string }>,
  userEnneatype?: number | null,
  peerEnneatype?: number | null
): string {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const conversationText = messages.map((m) => m.content).join(" \n");

  // Determine user and peer types
  let resolvedUserType = userEnneatype || null;
  if (!resolvedUserType) {
    const match = conversationText.match(/(?:meu padrão|meu eneatipo|sou tipo|tipo)\s*([1-9])/i) || lastUserMsg.match(/\b([1-9])\b/);
    if (match) resolvedUserType = parseInt(match[1], 10);
  }
  if (!resolvedUserType || !ENNEAGRAM_TYPES[resolvedUserType]) resolvedUserType = 1;

  let resolvedPeerType = peerEnneatype || null;
  if (!resolvedPeerType && pillarId === "feedback") {
    const match = conversationText.match(/(?:liderado|outra pessoa|pessoa envolvida|tipo)\s*([1-9])/i);
    if (match) resolvedPeerType = parseInt(match[1], 10);
    if (!resolvedPeerType || !ENNEAGRAM_TYPES[resolvedPeerType]) resolvedPeerType = 3;
  }

  const leaderInfo = ENNEAGRAM_TYPES[resolvedUserType] || ENNEAGRAM_TYPES[1];
  const peerInfo = resolvedPeerType ? ENNEAGRAM_TYPES[resolvedPeerType] : null;

  if (pillarId === "feedback") {
    if (peerInfo) {
      return `### 🎯 Roteiro de Feedback Executivo MasterMind

**Líder em Ação:** Tipo ${leaderInfo.id} (${leaderInfo.name}) • Virtude a manifestar: **${leaderInfo.virtue}**
**Liderado / Interlocutor:** Tipo ${peerInfo.id} (${peerInfo.name}) • Fixação a considerar: *${peerInfo.mentalFixation}*

---

#### 1. Diagnóstico Relacional & Dinâmica dos Padrões:
* **Seu Padrão como Líder (Tipo ${leaderInfo.id}):** ${leaderInfo.feedbackAdviceAsLeader}
* **Necessidade Comportamental do Liderado (Tipo ${peerInfo.id}):** ${peerInfo.feedbackAdviceAsSubordinate}
* **Gatilhos Emocionais a EVITAR TERMINANTEMENTE:** ${peerInfo.communicationTriggersToAvoid.join(" • ")}.

---

#### 2. Roteiro Executivo de 3 Passos (Palavras Sugeridas):

1. **Abertura com Vínculo e Intenção Positiva (Rapport):**
   > *"Quero começar destacando o quanto valorizo sua dedicação e contribuição. Estamos aqui para alinhar nossos passos e elevar juntos o padrão dos nossos resultados com total transparência."*

2. **Apresentação de Fatos Objetivos (Sem Julgamento de Caráter):**
   > *"Sobre a situação recente (${lastUserMsg.slice(0, 100).replace(/\n/g, " ") || "os últimos entregáveis"}), notei pontos que precisamos calibrar. Como você avalia o desfecho desse processo até aqui?"*

3. **Pacto de Ação & Compromisso Mútuo:**
   > *"Conectando com a sua virtude de ${peerInfo.virtue}, qual solução prática você propõe para ajustarmos isso imediatamente? Vamos traçar um plano de ação e acompanhar a evolução."*

---

#### 3. Princípio de Alta Performance Napoleon Hill:
> *"O autêntico líder não vence discussões pela força, mas conquista a cooperação voluntária alinhando mentes em torno de um propósito definido."*

Gostaria de calibrar alguma frase específica para o momento exato da sua conversa?`;
    }

    return `### 🎯 Assistente de Feedback Estratégico MasterMind

Entendido, Líder Tipo ${leaderInfo.id} (${leaderInfo.name}).

Para que eu formule o roteiro executivo com palavras exatas:
1. **Qual é o Eneatipo provável do liderado (1 a 9)?**
2. **Qual é a situação concreta que necessita de alinhamento?**

*Assim que você detalhar, entregarei o diagnóstico dos gatilhos e a estrutura completa.*`;
  }

  if (pillarId === "sos") {
    return `### 🛡️ SOS Inteligência Emocional MasterMind

**Líder em Comando:** Tipo ${leaderInfo.id} (${leaderInfo.name} - ${leaderInfo.subtitle})
**Vício Emocional Sob Estresse:** **${leaderInfo.emotionalVice}**
**Virtude Mestra a Resgatar:** **${leaderInfo.virtue}**

---

#### 🚨 2 Ações Práticas Imediatas de Domínio Próprio:
1. **${leaderInfo.sosActions[0]}**
2. **${leaderInfo.sosActions[1]}**

---

#### 💡 Atitude Mental de Cura (Napoleon Hill):
> *"${leaderInfo.healingAttitude}"*

---

#### 🌬️ Exercício de Centralização (Técnica dos 3 Tempos):
* Inspire pelo nariz em **4** tempos (trazendo clareza mental).
* Retenha o ar com firmeza por **2** tempos (afirmando seu comando interno).
* Expire suavemente pela boca em **6** tempos, dissolvendo a tensão de *${leaderInfo.emotionalVice}*.

> *"O autodomínio é a primeira e mais nobre vitória que um líder pode conquistar."* — Napoleon Hill

Como você percebe seu estado mental agora para dar o próximo direcionamento com serenidade?`;
  }

  // Bussola
  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão ${leaderInfo.id}:** ${leaderInfo.name} (${leaderInfo.subtitle})
**Virtude Farol do Dia:** **${leaderInfo.virtue}**
**Armadilha Comportamental a Contornar:** *${leaderInfo.mentalFixation}* (${leaderInfo.emotionalVice})

---

#### 📜 Pílula de Sabedoria Estratégica:
> *"${leaderInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${leaderInfo.turningPoint}
* **Aplicação Concreta:** Diante de sua principal decisão de hoje (*${lastUserMsg.slice(0, 80) || "suas reuniões e direcionamentos"}*), aplique deliberadamente a virtude de **${leaderInfo.virtue}**, agindo como referência de propósito e equilíbrio para sua equipe.

---

> *"Defina seu objetivo principal com clareza inabalável e coloque sua virtude mestra a serviço dessa realização."* — Napoleon Hill

Qual será sua primeira ação estratégica hoje para materializar esse desafio?`;
}

// Helper to format conversation turns properly for Gemini API (ensures alternating turns and starting with user)
function prepareGeminiContents(messages: Array<{ role: string; content: string }>) {
  const formatted: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const m of messages) {
    if (!m.content || !m.content.trim()) continue;
    const role: "user" | "model" = m.role === "assistant" ? "model" : "user";

    // If starting and it's a model message, skip it (system instruction already handles persona)
    if (formatted.length === 0 && role === "model") {
      continue;
    }

    // Merge consecutive turns with the same role to adhere strictly to alternating turn constraint
    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += `\n\n${m.content}`;
    } else {
      formatted.push({
        role,
        parts: [{ text: m.content }],
      });
    }
  }

  if (formatted.length === 0) {
    formatted.push({
      role: "user",
      parts: [{ text: "Olá Napoleon Hill. Como mentor MasterMind, apresente-se e oriente minha liderança." }],
    });
  }

  return formatted;
}

async function generateWithTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI generation timeout")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// API Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { pillarId, messages, userEnneatype, peerEnneatype } = req.body;
    const ai = getAI();

    if (!ai) {
      // Use rich deterministic MasterMind logic if no API key is available
      const fallbackResponse = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
      return res.json({ text: fallbackResponse, webSources: [] });
    }

    const pillar = PILLARS[pillarId] || PILLARS.feedback;
    const contents = prepareGeminiContents(messages || []);

    const userTypeStr = userEnneatype ? `Eneatipo do Líder: Tipo ${userEnneatype} (${ENNEAGRAM_TYPES[userEnneatype]?.name || ""})` : "Eneatipo do Líder a ser inferido da conversa";
    const peerTypeStr = peerEnneatype ? `Eneatipo do Liderado/Interlocutor: Tipo ${peerEnneatype} (${ENNEAGRAM_TYPES[peerEnneatype]?.name || ""})` : "Eneatipo do interlocutor a ser inferido se aplicável";

    const systemInstruction = `${SYSTEM_PROMPT}

PILAR ATUAL: ${pillar.badge} - ${pillar.title}
DESCRIÇÃO: ${pillar.description}
${userTypeStr}
${peerTypeStr}

DIRETRIZ DE PESQUISA & ATIVIDADE DINÂMICA:
- Você é Napoleon Hill. Elabore respostas profundas, dinâmicas, altamente personalizadas e estruturadas com clareza executiva, dividindo em seções claras (Diagnóstico do Padrão, Mecânica Comportamental, Roteiro Prático de Palavras Exatas e Princípio MasterMind).`;

    let responseText = "";
    let webSources: Array<{ title: string; uri: string }> = [];

    // Attempt generation with primary fast model gemini-3.6-flash, fallback to gemini-3.7-flash or local engine
    try {
      const response = await generateWithTimeout(
        ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        6000
      );
      responseText = response.text || "";
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (searchChunks && Array.isArray(searchChunks)) {
        for (const chunk of searchChunks) {
          if (chunk?.web?.uri) {
            webSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri,
            });
          }
        }
      }
    } catch (modelErr: any) {
      console.warn("Primary model gemini-3.6-flash attempt failed, trying gemini-3.7-flash:", modelErr?.message || modelErr);
      try {
        const response2 = await generateWithTimeout(
          ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          5000
        );
        responseText = response2.text || "";
      } catch (err2: any) {
        console.warn("Gemini API call failed or timed out, using high-precision local MasterMind engine:", err2?.message || err2);
        responseText = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
      }
    }

    if (!responseText) {
      responseText = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
    }

    return res.json({ text: responseText, webSources });
  } catch (error: any) {
    console.error("General Error in /api/chat:", error);
    const fallbackResponse = generateLocalMentorResponse(req.body?.pillarId || "feedback", req.body?.messages || [], req.body?.userEnneatype, req.body?.peerEnneatype);
    return res.json({ text: fallbackResponse, webSources: [] });
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
