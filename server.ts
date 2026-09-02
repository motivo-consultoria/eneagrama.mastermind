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
Você é Napoleon Hill, mentor de alta performance e liderança executiva da Fundação Napoleon Hill (MasterMind), integrando os ensinamentos da Lei do Triunfo, a atitude mental positiva e a metodologia dos 9 Padrões-Master do Eneagrama Sistêmico Vitruviano.

DIRETRIZES FUNDAMENTAIS & VOCABULÁRIO OBRIGATÓRIO:
1. TERMINOLOGIA OBRIGATÓRIA:
   - NUNCA use as palavras "eneatipo", "eneatipos", "tipo eneagramático" ou semelhantes.
   - USE SEMPRE "Padrão-Master", "padrão-master", "Padrões-Master" ou "Padrão X" (ex: "Padrão-Master 1", "Padrão-Master 8").
2. Identidade & Tom de Voz: Fale com a sabedoria, autoridade magnânima, visão prática e incentivo edificante de Napoleon Hill. Seja direto, profundo e focado em resultados executivos e autodomínio.
3. Axioma MasterMind Central: No MasterMind, o líder "NÃO É o seu padrão, ele SE ENCONTRA em um determinado padrão". A evolução do líder decorre de superar o Vício Emocional e acessar deliberadamente a sua Virtude Mestra.

REGRA DE OURO DE HIPER-PERSONALIZAÇÃO (CRUCIAL):
- É TERMINANTEMENTE PROIBIDO emitir respostas padronizadas, genéricas ou reutilizar respostas idênticas para situações diferentes do mesmo padrão.
- Para cada consulta, dedique pensamento profundo para analisar as variáveis e nuances singulares do caso: o contexto do negócio, o impacto financeiro/operacional, os sentimentos em jogo, os prazos, o histórico relatado e a dinâmica entre os Padrões-Master.
- Cada roteiro, fala recomendada, diagnóstico e desafio de 24h deve incorporar DIRETAMENTE os fatos, palavras e pessoas descritos pelo usuário.

Base teórica dos 9 Padrões-Master:
- Padrão-Master 1 (Perfeccionista / Ética e Perfeição): Virtude: Serenidade e Discernimento. Vício: Raiva reprimida / Ressentimento. Ferida: Traição / Imperfeição.
- Padrão-Master 2 (Auxiliador / Amor e Ajuda): Virtude: Humildade e Amor Incondicional (Autocuidado). Vício: Orgulho. Ferida: Não merecer ser amado.
- Padrão-Master 3 (Realizador / Desempenho e Sucesso): Virtude: Autenticidade e Verdade. Vício: Vaidade (Autoengano). Ferida: Fracassar / Ser rejeitado.
- Padrão-Master 4 (Idealista, Intenso, Profundo / Originalidade): Virtude: Equanimidade. Vício: Inveja (Sensação de falta). Ferida: Perda / Abandono.
- Padrão-Master 5 (Observador / Sabedoria): Virtude: Desprendimento e Engajamento. Vício: Avareza (Retenção). Ferida: Invasão / Desconfiança.
- Padrão-Master 6 (Cético Leal / Lealdade e Segurança): Virtude: Coragem e Autonomia. Vício: Medo / Ansiedade. Ferida: Desproteção.
- Padrão-Master 7 (Entusiasta / Otimismo e Prazer): Virtude: Sobriedade, Temperança e Foco. Vício: Gula (Dispersão). Ferida: Limitação / Sofrimento.
- Padrão-Master 8 (Contestador / Proteção e Justiça): Virtude: Inocência e Magnanimidade. Vício: Luxúria (Excesso de força/controle). Ferida: Vulnerabilidade / Perda do comando.
- Padrão-Master 9 (Mediador / Paz e União): Virtude: Ação Correta, Diligência e Posicionamento. Vício: Indolência / Esquecimento de si. Ferida: Separação / Conflito.

DELIMITAÇÃO DE ESCOPO:
- Esta mentoria é estritamente dedicada a: Liderança, Inteligência Emocional, Padrões-Master do Eneagrama Sistêmico, Filosofia MasterMind / Leis do Triunfo de Napoleon Hill, Gestão de Pessoas, Conflitos e Decisão Executiva.
- Se o usuário fugir desse escopo (pedir piadas, códigos, receitas, futebol, etc.), recuse polidamente e convide-o a retornar ao propósito definido da mentoria.

ESTRUTURA DE RESPOSTA POR PILAR:

1. PILAR 1: ASSISTENTE DE FEEDBACK ESTRATÉGICO
   Quando tiver o Padrão-Master do líder, o Padrão-Master do liderado e a situação concreta:
   - **Diagnóstico da Dinâmica Relacional**: Analise como a virtude/vício do líder interage com a fixação e o mecanismo de defesa do liderado especificamente na situação descrita.
   - **Gatilhos Emocionais a Evitar**: Liste 2 a 3 reações ou palavras que acionariam a defensiva imediata daquele liderado naquele contexto.
   - **Roteiro Cirúrgico de 3 Passos (com Palavras Exatas Personalizadas para o Caso)**:
     * *Passo 1 (Rapport e Intenção Positiva)*: Frase de abertura sob medida para desarmar o liderado.
     * *Passo 2 (Apresentação de Fatos & Impacto)*: Frase citando o fato exato descrito pelo usuário, sem julgamento moral, focada em impacto e responsabilidade.
     * *Passo 3 (Pacto de Ação & Compromisso Mútuo)*: Pergunta estratégica que evoca a virtude do liderado para gerar plano de ação concreto.
   - **Princípio MasterMind de Napoleon Hill**: Citação profunda conectada ao aprendizado dessa conversa.

2. PILAR 2: SOS INTELIGÊNCIA EMOCIONAL
   Quando tiver o Padrão-Master do líder e a situação de estresse/crise:
   - **Diagnóstico do Padrão sob Pressão**: Explique com precisão cirúrgica qual vício emocional e distorção perceptiva foi ativada por aquele incidente específico.
   - **2 Ações Práticas e Imediatas de Autodomínio**: Ações sob medida para o incidente ocorrido, para serem executadas nos próximos minutos.
   - **Atitude Mental de Cura Napoleon Hill**: Afirmação/pensamento restaurador customizado para a situação relatada.
   - **Exercício de Centralização Fisiológica**: Respiração com foco na transição do vício para a virtude mestra.

3. PILAR 3: BÚSSOLA DIÁRIA DE VIRTUDES
   Quando tiver o Padrão-Master do líder e a agenda/desafio do dia:
   - **Contextualização Profunda da Atividade**: Demonstre domínio das particularidades do evento/reunião mencionado (BNI, 1on1, Diretoria, Negociação, Apresentação, etc.).
   - **Cruzamento Estratégico com o Padrão-Master**: Analise onde o líder pode brilhar e onde mora o risco oculto do seu vício comportamental nessa atividade.
   - **Pílula de Sabedoria Napoleon Hill**: Princípio da Lei do Triunfo focado na atividade do dia.
   - **Desafio Prático de Liderança de 24 Horas**: Meta comportamental concreta, mensurável e personalizada para ser executada hoje durante a atividade.

Sempre responda em Português do Brasil com impecável formatação Markdown (títulos, negritos estratégicos, citações em bloco elegantes).
`;

// Check for off-scope queries in server handler
function isOffTopicQuery(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  const lower = text.toLowerCase();
  if (/(?:tipo|padr[ãa]o|eneatipo)\s*[1-9]/i.test(lower)) return false;
  if (/(?:lider|equipe|reuni[ãa]o|feedback|gest[aã]o|conflito|press[aã]o|meta|bni|1on1|diretoria|estresse|demiss|contrat|desempenho|relat[oó]rio|cliente|socio|sócio|vendas|projeto|atraso|erro)/i.test(lower)) return false;

  const offTopicPatterns = [
    /\b(receita|bolo de|como cozinhar|ingredientes para|fazer pizza|almo[cç]o)\b/i,
    /\b(escreva um c[oó]digo|crie uma fun[cç][aã]o|script em python|javascript|html|css|sql query|programar em)\b/i,
    /\b(conte uma piada|anedota|charada|piadinha)\b/i,
    /\b(previs[aã]o do tempo|vai chover|temperatura amanh[aã]|clima em)\b/i,
    /\b(resultado do jogo|brasileir[aã]o|quem ganhou o jogo|escalação do|tabela do campeonato|futebol)\b/i,
    /\b(hor[oó]scopo|mapa astral|signo de [a-z]+|astrologia)\b/i,
    /\b(calcule a integral|derivada de|raiz quadrada de|\d+\s*[\+\*\/\^]\s*\d+)\b/i,
    /\b(redação sobre|trabalho de escola|exerc[ií]cio de matemática)\b/i,
  ];
  return offTopicPatterns.some((pattern) => pattern.test(lower));
}

function getScopeBoundaryResponse(pillarId: string): string {
  const pillarTitles: Record<string, string> = {
    feedback: "Assistente de Feedback Estratégico",
    sos: "SOS Inteligência Emocional",
    bussola: "Bússola Diária de Virtudes",
  };
  const title = pillarTitles[pillarId] || "Mentoria Executiva";

  return `### ⚠️ Aviso de Escopo da Mentoria MasterMind

Olá, líder! Como seu mentor executivo da **Fundação Napoleon Hill (MasterMind)** e especialista no **Eneagrama Sistêmico Vitruviano**, meu compromisso com você é exclusivamente direcionar desafios de **liderança, inteligência emocional, gestão de pessoas e alta performance**.

> *"Defina seu objetivo com clareza inabalável. A dispersão e a perda de foco em um propósito definido são as principais causas do enfraquecimento do líder."* — Napoleon Hill

Não é possível avançar em conversas ou solicitações que fujam do escopo do pilar atual (**${title}**).

Por favor, compartilhe um **desafio de liderança**, uma **situação concreta com sua equipe** ou um **contexto de tomada de decisão** para continuarmos sua mentoria com foco e excelência.`;
}

// Helper to extract situation keywords and context for dynamic response customization
function analyzeSituationContext(text: string) {
  const lower = text.toLowerCase();
  
  const isDelay = /(atras|prazo|entrega|data limite|cronograma|demora)/i.test(lower);
  const isConflict = /(conflito|discuss|briga|desacordo|atrito|ego|clima pesado|grito|desrespeit)/i.test(lower);
  const isPerformance = /(meta|resultado|desempenho|vendas|produtividade|atingir|n[ãa]o bateu)/i.test(lower);
  const isDemotivation = /(desmotiva|desengaj|desanim|ap[aá]tico|n[ãa]o se importa|falta de vontade|isolad)/i.test(lower);
  const isError = /(erro|falha|grave|preju[ií]zo|reclam|cliente insatisfeito|recal|retrabalho)/i.test(lower);
  const isCareer = /(promo[cç][aã]o|sal[aá]rio|cargo|demiss|demitir|desligar|carreira|feedback anual)/i.test(lower);
  const isCrisis = /(crise|cancel|perda|processo|emerg[eê]ncia|p[aâ]nico|s[oó]cio|urgente)/i.test(lower);

  let situationTheme = "alinhamento executivo e desenvolvimento de equipe";
  if (isDelay) situationTheme = "cumprimento de prazos e disciplina operacional";
  else if (isConflict) situationTheme = "gestão de atritos interpessoais e alinhamento de postura";
  else if (isError) situationTheme = "correção de falha operacional e mitigação de riscos";
  else if (isPerformance) situationTheme = "atingimento de metas e elevação da régua de resultados";
  else if (isDemotivation) situationTheme = "resgate do engajamento e propósito de trabalho";
  else if (isCareer) situationTheme = "alinhamento de expectativas e decisões de carreira/equipe";
  else if (isCrisis) situationTheme = "gerenciamento de crise aguda e contenção de danos";

  return {
    theme: situationTheme,
    isDelay,
    isConflict,
    isPerformance,
    isDemotivation,
    isError,
    isCareer,
    isCrisis,
    rawExtract: text.replace(/\n/g, " ").trim().slice(0, 160)
  };
}

// Helper for local fallback mentorship with dynamic contextual personalization
function generateLocalMentorResponse(
  pillarId: string,
  messages: Array<{ role: string; content: string }>,
  userEnneatype?: number | null,
  peerEnneatype?: number | null
): string {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const conversationText = messages.map((m) => m.content).join(" \n");

  if (isOffTopicQuery(lastUserMsg)) {
    return getScopeBoundaryResponse(pillarId);
  }

  // Determine user and peer types
  let resolvedUserType = userEnneatype || null;
  if (!resolvedUserType) {
    const match = conversationText.match(/(?:meu padrão|meu padrao|sou padrão|sou padrao|padrão-master|padrão|padrao|tipo)\s*([1-9])/i) || lastUserMsg.match(/\b([1-9])\b/);
    if (match) resolvedUserType = parseInt(match[1], 10);
  }
  if (!resolvedUserType || !ENNEAGRAM_TYPES[resolvedUserType]) resolvedUserType = 1;

  let resolvedPeerType = peerEnneatype || null;
  if (!resolvedPeerType && pillarId === "feedback") {
    const match = conversationText.match(/(?:liderado|outra pessoa|pessoa envolvida|padrão do liderado|padrão|padrao|tipo)\s*([1-9])/i);
    if (match) resolvedPeerType = parseInt(match[1], 10);
    if (!resolvedPeerType || !ENNEAGRAM_TYPES[resolvedPeerType]) resolvedPeerType = 3;
  }

  const leaderInfo = ENNEAGRAM_TYPES[resolvedUserType] || ENNEAGRAM_TYPES[1];
  const peerInfo = resolvedPeerType ? ENNEAGRAM_TYPES[resolvedPeerType] : null;

  const sitAnalysis = analyzeSituationContext(conversationText + " " + lastUserMsg);

  if (pillarId === "feedback") {
    if (peerInfo) {
      // Dynamic tailored wording according to the specific situation
      let specificOpening = `"Quero começar reconhecendo seu papel e dedicação no time. Nosso propósito neste alinhamento é tratar de um ponto específico sobre ${sitAnalysis.theme}, para que possamos proteger nossos resultados e elevar sua performance com total respeito e parceria."`;
      let specificFact = `"Em relação ao episódio recente (*'${sitAnalysis.rawExtract || "as últimas entregas e interações"}'*), identifiquei impactos que demandam nossa intervenção imediata. Gostaria de ouvir primeiramente: como você avalia esse cenário e os desdobramentos que ele gerou?"`;
      let specificAction = `"Conectando com o seu potencial e a sua virtude de ${peerInfo.virtue}, qual é a sua proposta prática para recalibrarmos isso imediatamente? Quero que definamos um pacto claro de acompanhamento a partir de hoje."`;

      if (sitAnalysis.isDelay) {
        specificOpening = `"Valorizo a sua capacidade e o volume de demandas sob sua responsabilidade. Quero alinhar um ponto vital de compromisso e pontualidade sobre os nossos prazos."`;
        specificFact = `"Ao analisarmos o cronograma da situação (*'${sitAnalysis.rawExtract}'*), o atraso impactou o fluxo da equipe. O que exatamente causou esse gargalo e como podemos blindar os próximos prazos?"`;
      } else if (sitAnalysis.isConflict) {
        specificOpening = `"Tenho grande consideração por você e pelo ambiente de trabalho que construímos. Esta conversa tem o objetivo exclusivo de zelar pela nossa sinergia e postura de alto nível."`;
        specificFact = `"Sobre a divergência recente (*'${sitAnalysis.rawExtract}'*), a forma como a situação foi conduzida gerou tensão no grupo. Como podemos estabelecer um padrão de comunicação mais colaborativo e maduro?"`;
      } else if (sitAnalysis.isError) {
        specificOpening = `"Erros em processos complexos acontecem, mas o que diferencia os profissionais extraordinários é a rapidez na correção e a responsabilidade de assumir o plano de contenção."`;
        specificFact = `"Sobre a falha ocorrida (*'${sitAnalysis.rawExtract}'*), precisamos mapear a causa-raiz sem rodeios e assegurar que ela não se repita. Qual é o seu diagnóstico do que faltou checar?"`;
      }

      return `### 🎯 Roteiro de Feedback Executivo MasterMind

**Líder em Ação:** Padrão-Master ${leaderInfo.id} (${leaderInfo.name}) • Virtude a manifestar: **${leaderInfo.virtue}**
**Liderado / Interlocutor:** Padrão-Master ${peerInfo.id} (${peerInfo.name}) • Fixação a considerar: *${peerInfo.mentalFixation}*
**Foco da Situação:** ${sitAnalysis.theme.toUpperCase()}

---

#### 1. Diagnóstico Relacional & Dinâmica dos Padrões no Caso Concreto:
* **Seu Desafio como Líder (Padrão-Master ${leaderInfo.id}):** ${leaderInfo.feedbackAdviceAsLeader} Ao lidar com esta situação (*${sitAnalysis.theme}*), evite projetar seu vício de *${leaderInfo.emotionalVice}* e ancore sua autoridade na virtude da **${leaderInfo.virtue}**.
* **Como o Liderado (Padrão-Master ${peerInfo.id}) processa este momento:** ${peerInfo.feedbackAdviceAsSubordinate}
* **Gatilhos Emocionais a EVITAR TERMINANTEMENTE com o Padrão-Master ${peerInfo.id}:**
  - ${peerInfo.communicationTriggersToAvoid[0] || "Acusações genéricas ou tom punitivo desproporcional"}
  - ${peerInfo.communicationTriggersToAvoid[1] || "Ignorar o ponto de vista do liderado"}
  - Não desqualifique o esforço dele diante do problema relatado (*${sitAnalysis.rawExtract.slice(0, 70)}...*).

---

#### 2. Roteiro Executivo de 3 Passos (Palavras Cirúrgicas Sugeridas):

1. **Abertura com Vínculo e Intenção Positiva (Rapport Estratégico):**
   > ${specificOpening}

2. **Apresentação de Fatos Objetivos (Foco no Impacto Real, Sem Julgamento Moral):**
   > ${specificFact}

3. **Pacto de Ação & Compromisso Mútuo de Responsabilidade:**
   > ${specificAction}

---

#### 3. Princípio de Alta Performance Napoleon Hill:
> *"A cooperação voluntária não se obtém por imposição ou intimidação, mas pelo despertar do propósito nobre na mente do seu liderado."* — Napoleon Hill

Como você se sente com essa formulação para conduzir o alinhamento? Deseja ajustar algum detalhe prático da conversa?`;
    }

    return `### 🎯 Assistente de Feedback Estratégico MasterMind

Entendido, Líder **Padrão-Master ${leaderInfo.id} (${leaderInfo.name})**.

Para que eu formule o roteiro de feedback sob medida com palavras exatas:
1. **Qual é o Padrão-Master provável do seu liderado ou interlocutor (1 a 9)?**
2. **Qual é a situação concreta que precisa ser alinhada?** *(Conte brevemente o ocorrido, impacto e o resultado esperado)*

*Assim que você indicar, entregarei o diagnóstico cirúrgico da relação e o roteiro completo.*`;
  }

  if (pillarId === "sos") {
    // Dynamic customization for SOS according to crisis type
    let emergencyAction1 = leaderInfo.sosActions[0];
    let emergencyAction2 = leaderInfo.sosActions[1];
    let contextGuidance = `Diante da pressão relatada (*'${sitAnalysis.rawExtract || "momento de alta turbulência"}'*), o seu Padrão-Master ${leaderInfo.id} tende a reagir ativando o vício de **${leaderInfo.emotionalVice}** e a fixação de *${leaderInfo.mentalFixation}*.`;

    if (sitAnalysis.isConflict || sitAnalysis.isCrisis) {
      emergencyAction1 = `**Pausa Tática de 5 Minutos Sem Reação Verbal:** Não tome decisões nem envie mensagens no calor da discussão. Declare: *"Vou analisar os dados com profundidade e retorno nosso posicionamento às [horário específico]"*.`;
      emergencyAction2 = `**Separação entre Fato e Reação Emocional:** Anote em um papel: 1) O que é fato objetivo inegável? 2) O que é suposição da mente sob o filtro de ${leaderInfo.emotionalVice}? Responda apenas ao fato.`;
    } else if (sitAnalysis.isError || sitAnalysis.isPerformance) {
      emergencyAction1 = `**Desarme da Culpa e Foco em Solução Imediata:** Respire fundo e convoque sua virtude de **${leaderInfo.virtue}**. Pergunte à equipe: *"O fato aconteceu; agora, qual é o plano de contingência para os próximos 60 minutos?"*.`;
      emergencyAction2 = `**Isolamento do Problema:** Não permita que o erro em uma área contamine sua autoconfiança no restante das operações do dia.`;
    }

    return `### 🛡️ SOS Inteligência Emocional MasterMind

**Líder em Comando:** Padrão-Master ${leaderInfo.id} (${leaderInfo.name} — ${leaderInfo.subtitle})
**Gatilho Ativado:** ${sitAnalysis.theme.toUpperCase()}
**Vício Emocional Sob Estresse:** **${leaderInfo.emotionalVice}**
**Virtude Mestra a Resgatar Imediatamente:** **${leaderInfo.virtue}**

---

#### 🔍 Diagnóstico do Momento de Pressão:
${contextGuidance}
A mente executiva sob estresse tende a perder a visão panorâmica. Seu objetivo agora não é 'vencer a crise' no grito ou na pressa, mas recuperar seu centro de comando interno.

---

#### 🚨 2 Ações Práticas Imediatas de Domínio Próprio:
1. ${emergencyAction1}
2. ${emergencyAction2}

---

#### 💡 Atitude Mental de Cura Napoleon Hill:
> *"${leaderInfo.healingAttitude}"*

---

#### 🌬️ Exercício de Centralização Fisiológica (Técnica 4-2-6):
* **Inspire pelo nariz em 4 segundos:** Conecte-se com a virtude da **${leaderInfo.virtue}** e clareza mental.
* **Retenha o ar por 2 segundos:** Afirme internamente sua soberania e autodomínio executivo.
* **Expire suavemente pela boca em 6 segundos:** Expulse a tensão, a pressa e a reatividade de *${leaderInfo.emotionalVice}*.

> *"O homem que não consegue controlar as suas próprias emoções jamais poderá controlar as circunstâncias ao seu redor."* — Napoleon Hill

Como você sente seu nível de serenidade e clareza agora para dar o próximo passo?`;
  }

  // PILAR 3: BÚSSOLA DIÁRIA DE VIRTUDES
  const lowerMsg = (lastUserMsg + " " + conversationText).toLowerCase();
  let activityContextSection = "";

  if (lowerMsg.includes("bni") || lowerMsg.includes("business network")) {
    activityContextSection = `#### 🌐 Contexto Estratégico da Atividade: Reunião do BNI (Business Network International)
* **A Dinâmica do BNI:** O BNI é a maior organização de networking profissional e referências qualificadas de negócios do mundo. Sua premissa fundamental é a filosofia **"Givers Gain" (Ganhar Conquistando / Doar para Receber)**.
* **Momentos Críticos na Reunião:** O pitch de apresentação semanal (30 a 60 segundos), a postura executiva impecável, a pontualidade rigorosa e a geração de referências confiáveis.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id} (${leaderInfo.name}):** ${
      leaderInfo.id === 7
        ? "Como Entusiasta (Padrão-Master 7), seu magnetismo, simpatia e energia são pontos fortíssimos no networking. Todavia, o perigo é a dispersão de ideias ou tentar vender produtos múltiplos no seu pitch de 30s. Aplique a virtude da **Sobriedade e Foco**: escolha UMA única especialidade, seja cirúrgico no pedido de referência específica e transmita solidez inabalável aos membros do grupo."
        : leaderInfo.id === 3
        ? "Como Realizador (Padrão-Master 3), seu pitch é naturalmente polido e eficiente. O risco é soar puramente transacional. Conecte-se genuinamente com o valor e a ajuda que você pode levar aos outros membros do grupo."
        : leaderInfo.id === 8
        ? "Como Desafiador (Padrão-Master 8), sua presença transmite autoridade e liderança imediata. Cuide para que sua postura firme não intimide membros novos; mostre-se como um parceiro leal e protetor de novos negócios."
        : leaderInfo.id === 1
        ? "Como Perfeccionista (Padrão-Master 1), sua credibilidade e pontualidade são exemplares. Cuidado para não julgar mentalmente o pitch imperfeito dos colegas; use a virtude da **Serenidade** para acolher e gerar pontes de negócios."
        : `Utilize a virtude mestra de **${leaderInfo.virtue}** para posicionar sua autoridade e criar alianças de alto valor no grupo.`
    }

---
`;
  } else if (lowerMsg.includes("1on1") || lowerMsg.includes("um a um") || lowerMsg.includes("alinhamento individual")) {
    activityContextSection = `#### 👥 Contexto Estratégico da Atividade: Reunião 1on1
* **A Dinâmica Executiva do 1on1:** O 1on1 não é uma prestação de contas burocrática, mas um espaço nobre de escuta ativa, desenvolvimento de liderados e remoção de barreiras operacionais.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Pratique a virtude de **${leaderInfo.virtue}**. Fale menos e ouça com atenção plena, buscando compreender os anseios do liderado antes de orientar.

---
`;
  } else if (lowerMsg.includes("diretoria") || lowerMsg.includes("conselho") || lowerMsg.includes("board")) {
    activityContextSection = `#### 🏛️ Contexto Estratégico da Atividade: Reunião de Diretoria / Conselho
* **A Dinâmica Executiva:** O conselho e a diretoria demandam síntese estratégica, clareza numérica de indicadores, governança e alinhamento de longo prazo.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Utilize a virtude de **${leaderInfo.virtue}** para sustentar posicionamentos firmes sem cair na reatividade de *${leaderInfo.emotionalVice}*.

---
`;
  } else if (lowerMsg.includes("negocia") || lowerMsg.includes("venda") || lowerMsg.includes("proposta")) {
    activityContextSection = `#### 💼 Contexto Estratégico da Atividade: Negociação Comercial / Apresentação de Proposta
* **A Dinâmica Executiva:** Negociações de alto valor exigem identificação das reais dores do cliente, geração de valor mútuo e firmeza de condições.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Ancore-se na virtude de **${leaderInfo.virtue}** para manter a serenidade e conduzir a negociação para um pacto Ganha-Ganha exemplar.

---
`;
  }

  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão-Master ${leaderInfo.id}:** ${leaderInfo.name} (${leaderInfo.subtitle})
**Virtude Farol do Dia:** **${leaderInfo.virtue}**
**Armadilha Comportamental a Neutralizar:** *${leaderInfo.mentalFixation}* (${leaderInfo.emotionalVice})

---

${activityContextSection}#### 📜 Pílula de Sabedoria Estratégica Napoleon Hill:
> *"${leaderInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${leaderInfo.turningPoint}
* **Aplicação na sua Agenda de Hoje:** Diante do seu compromisso (*${lastUserMsg.slice(0, 110) || "suas principais decisões e reuniões do dia"}*), tome a decisão deliberada de agir pela virtude de **${leaderInfo.virtue}**. Ao se deparar com imprevistos ou tentações de agir por impulso, faça uma pausa de 3 segundos e conduza com a maestria de um líder MasterMind.

---

> *"Defina o seu objetivo principal com clareza inabalável e coloque a sua virtude mestra a serviço da realização desse propósito."* — Napoleon Hill

Qual será o seu primeiro ato de liderança hoje para colocar essa virtude em prática?`;
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

async function generateWithTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
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

    const userTypeStr = userEnneatype ? `Padrão-Master do Líder: Padrão-Master ${userEnneatype} (${ENNEAGRAM_TYPES[userEnneatype]?.name || ""})` : "Padrão-Master do Líder a ser identificado na conversa";
    const peerTypeStr = peerEnneatype ? `Padrão-Master do Liderado/Interlocutor: Padrão-Master ${peerEnneatype} (${ENNEAGRAM_TYPES[peerEnneatype]?.name || ""})` : "Padrão-Master do interlocutor a ser identificado se aplicável";

    const systemInstruction = `${SYSTEM_PROMPT}

PILAR ATUAL: ${pillar.badge} - ${pillar.title}
DESCRIÇÃO DO PILAR: ${pillar.description}
${userTypeStr}
${peerTypeStr}

DIRETRIZ DE EXECUÇÃO EXCLUSIVA:
- Você é Napoleon Hill. Analise com máxima perspicácia todos os fatos, nomes, papéis, números e contexto trazidos pelo líder.
- NUNCA use as palavras "eneatipo" ou "eneatipos". Use exclusivamente "Padrão-Master" ou "Padrões-Master".
- É ABSOLUTAMENTE PROIBIDO gerar respostas padronizadas, clichês ou genéricas. Crie uma solução 100% personalizada e cirúrgica para a situação específica relatada.`;

    let responseText = "";
    let webSources: Array<{ title: string; uri: string }> = [];

    // Primary model: gemini-3.7-flash with thinking for high-level executive depth
    try {
      const response = await generateWithTimeout(
        ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        30000
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
      console.log("Primary model notice, using tailored local MasterMind engine:", modelErr?.message || modelErr);
      responseText = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
    }

    if (!responseText) {
      responseText = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
    }

    return res.json({ text: responseText, webSources });
  } catch (error: any) {
    console.log("Chat endpoint fallback:", error?.message || error);
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

    const defaultPatternText = enneatypesDetected?.replace(/eneatipo/gi, "Padrão-Master") || "Padrões-Master do Eneagrama Sistêmico";

    if (!ai) {
      return res.json({
        title: pillar.title,
        enneatypeText: defaultPatternText,
        keyLearnings: [
          "Identificação do Padrão-Master e conscientização clara dos gatilhos de estresse.",
          "Transição deliberada do vício emocional para a virtude mestra de liderança.",
          "Roteiro prático com comunicação não-reativa e alinhamento de compromissos mútuos.",
          "Desafio de alta performance para aplicação nas próximas 24 horas sob a metodologia MasterMind."
        ],
        quote: "Você não é o seu padrão, você se encontra nele. A verdadeira liderança nasce do despertar da virtude."
      });
    }

    const summaryPrompt = `Analise a seguinte sessão de mentoria de liderança do pilar "${pillar.title}".
NUNCA use a palavra "eneatipo". Use "Padrão-Master" ou "Padrões-Master".
Gere um JSON com o seguinte formato exato:
{
  "title": "${pillar.title}",
  "enneatypeText": "Padrão(ões)-Master trabalhado(s) na sessão de forma concisa",
  "keyLearnings": [
    "Aprendizado 1 altamente específico para a situação do líder",
    "Aprendizado 2 altamente específico para a situação do líder",
    "Aprendizado 3 altamente específico para a situação do líder",
    "Aprendizado 4 altamente específico para a situação do líder"
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
    const defaultPatternText = req.body?.enneatypesDetected?.replace(/eneatipo/gi, "Padrão-Master") || "Padrões-Master do Eneagrama Sistêmico";
    return res.json({
      title: pillar.title,
      enneatypeText: defaultPatternText,
      keyLearnings: [
        "Reconhecimento do Padrão-Master ativado na situação concreta.",
        "Acesso à virtude correspondente para restaurar o autodomínio executivo.",
        "Estratégia cirúrgica de comunicação e liderança de alta performance.",
        "Aplicação contínua da filosofia MasterMind no cotidiano de gestão."
      ],
      quote: "O autodomínio é a primeira e mais nobre vitória que um líder pode conquistar."
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
