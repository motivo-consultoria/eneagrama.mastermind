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
Você é Napoleon Hill, mentor de alta performance e liderança executiva da Fundação Napoleon Hill (MasterMind), integrando os ensinamentos da Lei do Triunfo, a Atitude Mental Positiva e a metodologia dos 9 Padrões-Master do Eneagrama Sistêmico Vitruviano.

DIRETRIZES FUNDAMENTAIS & VOCABULÁRIO OBRIGATÓRIO:
1. TERMINOLOGIA OBRIGATÓRIA:
   - NUNCA use as palavras "eneatipo", "eneatipos", "tipo eneagramático" ou semelhantes.
   - USE SEMPRE "Padrão-Master", "padrão-master", "Padrões-Master" ou "Padrão X" (ex: "Padrão-Master 1", "Padrão-Master 8").
2. Identidade & Tom de Voz: Fale com a sabedoria magnânima, visão prática, presença executiva e incentivo edificante de Napoleon Hill. Seja direto, profundo, humano e focado em resultados reais e autodomínio.
3. Axioma MasterMind Central: No MasterMind, o líder "NÃO É o seu padrão, ele SE ENCONTRA em um determinado padrão". A evolução do líder decorre de superar o Vício Emocional e acessar deliberadamente a sua Virtude Mestra.

REGRA DE OURO DA MENTORIA MASTERMIND: REFLEXÃO PROFUNDA, ESPELHAMENTO E PERSONALIZAÇÃO TOTAL
- É TERMINANTEMENTE PROIBIDO emitir respostas padronizadas, clichês ou reutilizar a mesma estrutura para tópicos diferentes.
- Cada líder que busca sua orientação traz uma realidade singular (seja conduzir um treinamento de gestão de mudança, alinhar finanças em família com a esposa, resolver um impasse com um sócio, dar feedback para um especialista técnico arrogante ou apresentar ao conselho).
- Demonstre domínio profundo dos termos técnicos, metodologias e contextos citados (pesquise e aprofunde o significado real de cada conceito).

ESTRUTURA OBRIGATÓRIA DE CADA RESPOSTA:

PASSO 1: ESPELHAMENTO EMPÁTICO & CONEXÃO GENUÍNA (Acolhimento da Realidade do Líder)
- Inicie OBRIGATORIAMENTE validando e espelhando com profunda sensibilidade e precisão o desafio real trazido pelo usuário.
- Demonstre que você ouviu e compreendeu a dor, a complexidade e o que está em jogo (as emoções, as pressões, os riscos e as relações humanas envolvidas).

PASSO 2: ANÁLISE DE CONTEXTO & DOMÍNIO DOS TERMOS CITADOS
- Incorpore com maestria os conceitos específicos mencionados (ex: dinâmicas de Gestão de Mudança, alinhamento orçamentário do casal, governança societária, postura em reuniões BNI, condução de 1on1s, etc.).

PASSO 3: DIAGNÓSTICO DO PADRÃO-MASTER NO CASO CONCRETO & GATILHOS A EVITAR
- Explique exatamente como o Padrão-Master do Líder tende a reagir sob pressão neste caso específico (a armadilha do seu vício emocional).
- Se houver outra pessoa envolvida, analise a reação do Padrão-Master dela e liste de 2 a 3 gatilhos emocionais/verbais que devem ser evitados a todo custo.
- Mostre como a Virtude Mestra do Líder é a chave para destravar a melhor solução.

PASSO 4: ROTEIRO CIRÚRGICO / PLANO PRÁTICO COM PALAVRAS EXATAS
- Forneça falas recomendadas, perguntas estratégicas e passos desenhados EXCLUSIVAMENTE para a situação relatada pelo usuário.

PASSO 5: PRINCÍPIO MASTERMIND DE NAPOLEON HILL & DESAFIO DE 24 HORAS
- Citação inspiradora de Napoleon Hill diretamente conectada ao tema.
- Um desafio prático e mensurável para o líder aplicar hoje.

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
- Esta mentoria é estritamente dedicada a: Liderança, Inteligência Emocional, Padrões-Master do Eneagrama Sistêmico, Filosofia MasterMind / Leis do Triunfo de Napoleon Hill, Gestão de Pessoas, Conflitos e Decisão Executiva (inclusive alinhamentos de vida pessoal e familiar de alto impacto para a liderança).
- Se o usuário pedir receitas, códigos de programação, piadas, futebol ou astrologia, recuse polidamente e convide-o a retornar ao propósito definido da mentoria.

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

// Deep situational context analyzer for executive mentorship
function analyzeSituationContext(text: string) {
  const lower = text.toLowerCase();

  const isChangeManagement = /(gest[aã]o da mudan[cç]a|gestao da mudanca|mudan[cç]a|transforma[cç][aã]o|treinamento|workshop|capacita[cç][aã]o|novo processo|resist[eê]ncia|cultura|ado[cç][aã]o)/i.test(lower);
  const isFamilyFinances = /(finan[cç]as?|esposa|marido|c[oô]njuge|casamento|casa|or[cç]amento|dinheiro|gastos|investimento|d[ií]vida|contas|economia)/i.test(lower) && /(esposa|marido|c[oô]njuge|casal|casa|fam[ií]lia|filhos)/i.test(lower);
  const isPartnerConflict = /(s[oó]cio|sociedade|equity|cotas|participa[cç][aã]o societ[aá]ria|divis[aã]o de tarefas|acordo de s[oó]cios|alian[cç]a societ[aá]ria)/i.test(lower);
  const isTechSenior = /(desenvolvedor|programador|dev|tech lead|engenheiro|arrogante|s[eê]nior|t[eé]cnico|compet[eê]ncia t[eé]cnica|ego|juniores|junior)/i.test(lower);
  const isBNI = /(bni|business network|pitch|refer[eê]ncias|givers gain|60 segundos|30 segundos|networking)/i.test(lower);
  const isOneOnOne = /(1on1|one on one|um a um|alinhamento individual|conversa individual|pdi)/i.test(lower);
  const isBoardMeeting = /(conselho|board|diretoria|investidores|assembleia|apresenta[cç][aã]o executiva)/i.test(lower);
  const isContractLossOrCrisis = /(perdi um contrato|perda de contrato|500k|preju[ií]zo|cancelamento|cliente cancelou|crise grave|emerg[eê]ncia|erro grave)/i.test(lower);
  const isSalesNegotiation = /(negocia[cç][aã]o|vendas|proposta comercial|fechamento|obje[cç][aã]o|pre[cç]o|desconto)/i.test(lower);
  const isFiringHiring = /(demitir|demiss[aã]o|desligar|desligamento|contrata[cç][aã]o|admitir|entrevista)/i.test(lower);
  const isDemotivation = /(desmotiva|desengaj|desanim|ap[aá]tico|falta de vontade|isolad|clima pesado)/i.test(lower);
  const isDelay = /(atras|prazo|entrega|data limite|cronograma|demora|deadline)/i.test(lower);
  const isConflict = /(conflito|discuss|briga|desacordo|atrito|ego|grito|desrespeit)/i.test(lower);
  const isError = /(erro|falha|grave|reclam|cliente insatisfeito|retrabalho)/i.test(lower);
  const isPerformance = /(meta|resultado|desempenho|produtividade|atingir|n[ãa]o bateu)/i.test(lower);

  let situationTheme = "alinhamento executivo e desenvolvimento de equipe";
  if (isChangeManagement) situationTheme = "treinamento e condução de Gestão da Mudança";
  else if (isFamilyFinances) situationTheme = "alinhamento financeiro familiar e de casal";
  else if (isPartnerConflict) situationTheme = "alinhamento de sociedade e governança entre sócios";
  else if (isTechSenior) situationTheme = "feedback comportamental para especialista técnico sênior";
  else if (isBNI) situationTheme = "apresentação estratégica e networking estruturado BNI";
  else if (isOneOnOne) situationTheme = "reunião 1on1 de desenvolvimento individual";
  else if (isBoardMeeting) situationTheme = "apresentação executiva para Conselho / Diretoria";
  else if (isContractLossOrCrisis) situationTheme = "gerenciamento de crise aguda e recuperação de confiança";
  else if (isSalesNegotiation) situationTheme = "negociação comercial e defesa de proposta de valor";
  else if (isFiringHiring) situationTheme = "condução de transição de equipe / desligamento ético";
  else if (isDelay) situationTheme = "cumprimento de prazos e disciplina operacional";
  else if (isConflict) situationTheme = "gestão de atritos interpessoais e alinhamento de postura";
  else if (isError) situationTheme = "correção de falha operacional e contenção de danos";
  else if (isPerformance) situationTheme = "atingimento de metas e elevação da régua de resultados";
  else if (isDemotivation) situationTheme = "resgate do engajamento e propósito de trabalho";

  return {
    theme: situationTheme,
    isChangeManagement,
    isFamilyFinances,
    isPartnerConflict,
    isTechSenior,
    isBNI,
    isOneOnOne,
    isBoardMeeting,
    isContractLossOrCrisis,
    isSalesNegotiation,
    isFiringHiring,
    isDelay,
    isConflict,
    isPerformance,
    isDemotivation,
    isError,
    rawExtract: text.replace(/\n/g, " ").trim().slice(0, 200)
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

  const sit = analyzeSituationContext(conversationText + " " + lastUserMsg);

  // ==========================================
  // PILAR 1: FEEDBACK ESTRATÉGICO
  // ==========================================
  if (pillarId === "feedback") {
    if (peerInfo) {
      let mirroring = "";
      let specificOpening = "";
      let specificFact = "";
      let specificAction = "";
      let customNapoleonQuote = `"A cooperação voluntária não se obtém por imposição ou intimidação, mas pelo despertar do propósito nobre na mente do seu liderado." — Napoleon Hill`;
      let customChallenge = `Conduzir a conversa estruturada aplicando a virtude da ${leaderInfo.virtue}, mantendo escuta ativa em 70% do tempo.`;

      if (sit.isChangeManagement) {
        mirroring = `Compreendo profundamente a relevância e o peso deste momento. Conduzir um treinamento de **Gestão da Mudança** não é apenas transmitir novos processos ou metodologias: é gerenciar a ansiedade humana frente ao desconhecido. Quando as pessoas resistem à mudança, elas não estão necessariamente rejeitando o projeto — estão expressando o medo de perder relevância, autoridade ou segurança.`;
        specificOpening = `"Quero iniciar reconhecendo o valor do seu trabalho e a importância que você tem para a nossa equipe. Sei que momentos de transição geram dúvidas e inseguranças legítimas, e nosso objetivo aqui é construir esse caminho juntos com total transparência."`;
        specificFact = `"Ao implementarmos este novo processo (*'${sit.rawExtract}'*), notei que surgiram ruídos e resistências na adoção. Gostaria de ouvir genuinamente de você: quais são os maiores desafios que você e o time estão enxergando na prática?"`;
        specificAction = `"Conectando com a sua virtude de ${peerInfo.virtue}, como podemos transformar você em um embaixador dessa nova fase, garantindo que o time se sinta acolhido e capacitado para vencer essa transição?"`;
        customNapoleonQuote = `"Quem não consegue liderar a si mesmo diante da incerteza jamais conseguirá guiar outras pessoas através dos ventos da mudança." — Napoleon Hill`;
        customChallenge = `Antes do treinamento, faça um alinhamento prévio de 15 minutos com os influenciadores-chave da equipe para mapear suas principais dores e acolhê-las na apresentação.`;
      } else if (sit.isFamilyFinances) {
        mirroring = `Reconheço a sensibilidade, a nobreza e a vulnerabilidade dessa situação. Conversas sobre finanças no casamento vão muito além de planilhas e extratos bancários: tocam diretamente em segurança emocional, sonhos compartilhados, estilos de vida e receios individuais. Poucos diálogos exigem tanta delicadeza, cumplicidade e ausência de tom inquisitivo.`;
        specificOpening = `"Quero ter uma conversa de coração aberto sobre o nosso futuro e os nossos sonhos como casal. O dinheiro para nós deve ser um instrumento de liberdade e paz, e quero que construamos juntos um plano em que ambos se sintam seguros e felizes."`;
        specificFact = `"Analisando nossos projetos e o momento atual (*'${sit.rawExtract}'*), sinto que precisamos calibrar nossas prioridades para que nenhum dos dois se sinta sobrecarregado ou privado. Como você enxerga nosso orçamento e o que podemos ajustar com serenidade?"`;
        specificAction = `"Que tal definirmos três objetivos comuns para os próximos meses — como uma reserva de tranquilidade e um projeto de lazer para nós — e estabelecermos um pacto mensal de acompanhamento leve e sem cobranças mútuas?"`;
        customNapoleonQuote = `"A harmonia no lar e a comunhão de propósitos são os alicerces mais sólidos sobre os quais um líder constrói sua verdadeira riqueza." — Napoleon Hill`;
        customChallenge = `Agendar um jantar ou café tranquilo exclusivamente para sonhar juntos com as metas da família antes de abrir planilhas financeiras.`;
      } else if (sit.isPartnerConflict) {
        mirroring = `Compreendo a complexidade e a gravidade de alinhar expectativas com um sócio. Uma sociedade de negócios é um pacto de confiança comparável a um casamento corporativo. Quando surgem desalinhamentos de entrega ou visão, a empresa inteira sofre a oscilação de comando.`;
        specificOpening = `"Tenho imenso respeito pela nossa jornada de sociedade e pelo que construímos até aqui. Esta conversa visa blindar o futuro da nossa empresa e assegurar que nossa aliança MasterMind continue forte e equilibrada."`;
        specificFact = `"Em relação aos nossos acordos recentes (*'${sit.rawExtract}'*), vejo que a divisão de responsabilidades e as entregas acordadas não estão no nível necessário para a sustentabilidade do negócio. Como você avalia a sua dedicação atual e os gargalos enfrentados?"`;
        specificAction = `"Para restabelecermos o equilíbrio e a virtude da ${peerInfo.virtue} na sociedade, quais compromissos claros e mensuráveis assumimos hoje quanto a papéis, prazos e prestação de contas mútua?"`;
        customNapoleonQuote = `"Uma aliança MasterMind só sobrevive quando há perfeita harmonia de propósitos, transparência absoluta e dedicação equitativa entre as partes." — Napoleon Hill`;
        customChallenge = `Redigir uma matriz de papéis e responsabilidades (RACI) objetiva para validação formal entre os sócios nas próximas 24 horas.`;
      } else if (sit.isTechSenior) {
        mirroring = `Reconheço esse desafio clássico da liderança técnica: como lapidar um profissional de altíssimo domínio técnico cujo comportamento arrogante ou impaciente contamina o desenvolvimento dos profissionais juniores e fragiliza a cultura da equipe.`;
        specificOpening = `"Admiro profundamente o seu domínio técnico e a qualidade do seu código/arquitetura. Nosso objetivo neste feedback é elevar sua liderança e influência positiva sobre todo o ecossistema do time."`;
        specificFact = `"Observei em interações recentes (*'${sit.rawExtract}'*) posturas que desestimulam os membros mais jovens a perguntar e colaborar. Quando um sênior responde de forma áspera, o time recua e para de inovar. Como você percebe o impacto das suas palavras no crescimento deles?"`;
        specificAction = `"Com a virtude de ${peerInfo.virtue}, o que você acha de assumir formalmente a mentoria de um dos juniores por 30 dias, praticando uma postura pedagógica e paciente?"`;
        customNapoleonQuote = `"O verdadeiro poder de um especialista não reside no quanto ele sabe, mas na sua capacidade de elevar os que estão ao seu redor." — Napoleon Hill`;
        customChallenge = `Criar uma regra de ouro para a equipe técnica: 'Nenhuma dúvida técnica é óbvia; cada pergunta é uma oportunidade de mentoria coletiva'.`;
      } else {
        mirroring = `Compreendo com clareza os contornos e o impacto do desafio que você trouxe à tona (*'${sit.rawExtract}'*). Liderar com sabedoria exige enxergar além da superfície do problema e tratar a causa-raiz com equilíbrio emocional e autoridade moral.`;
        specificOpening = `"Quero começar reconhecendo seu papel e dedicação. Nosso propósito neste alinhamento é tratar de um ponto específico sobre ${sit.theme}, para que possamos proteger nossos resultados e elevar sua performance com total respeito e parceria."`;
        specificFact = `"Em relação ao episódio recente (*'${sit.rawExtract}'*), identifiquei impactos diretos que demandam nossa intervenção imediata. Gostaria de ouvir primeiramente: como você avalia esse cenário e os desdobramentos que ele gerou?"`;
        specificAction = `"Conectando com o seu potencial e a sua virtude de ${peerInfo.virtue}, qual é a sua proposta prática para recalibrarmos isso imediatamente? Quero que definamos um pacto claro de acompanhamento a partir de hoje."`;
      }

      return `### 🎯 Roteiro de Feedback Executivo MasterMind

**Líder em Ação:** Padrão-Master ${leaderInfo.id} (${leaderInfo.name}) • Virtude Farol: **${leaderInfo.virtue}**
**Liderado / Interlocutor:** Padrão-Master ${peerInfo.id} (${peerInfo.name}) • Fixação a Considerar: *${peerInfo.mentalFixation}*
**Contexto Operacional:** ${sit.theme.toUpperCase()}

---

#### 🤝 1. Espelhamento & Conexão Inicial:
${mirroring}

---

#### 🔍 2. Diagnóstico da Dinâmica Relacional dos Padrões-Master:
* **Seu Desafio como Líder (Padrão-Master ${leaderInfo.id}):** ${leaderInfo.feedbackAdviceAsLeader} Ao conduzir este diálogo (*${sit.theme}*), evite projetar o vício de *${leaderInfo.emotionalVice}* e ancore sua presença na virtude da **${leaderInfo.virtue}**.
* **Como o Interlocutor (Padrão-Master ${peerInfo.id}) processa este momento:** ${peerInfo.feedbackAdviceAsSubordinate}
* **Gatilhos Emocionais a EVITAR TERMINANTEMENTE com o Padrão-Master ${peerInfo.id}:**
  - **1.** ${peerInfo.communicationTriggersToAvoid[0] || "Acusações genéricas ou tom inquisitivo/punitivo"}
  - **2.** ${peerInfo.communicationTriggersToAvoid[1] || "Ignorar o ponto de vista ou os sentimentos do liderado"}
  - **3.** Não minimize a percepção dele sobre o contexto (*${sit.rawExtract.slice(0, 60)}...*).

---

#### 🗣️ 3. Roteiro Executivo de 3 Passos (Palavras Cirúrgicas Sugeridas):

1. **Abertura com Vínculo e Intenção Positiva (Rapport Estratégico):**
   > ${specificOpening}

2. **Apresentação de Fatos Objetivos (Sem Julgamento Moral, Foco no Impacto):**
   > ${specificFact}

3. **Pacto de Ação & Compromisso Mútuo de Responsabilidade:**
   > ${specificAction}

---

#### ⚡ 4. Desafio MasterMind de 24 Horas & Princípio Napoleon Hill:
* **Desafio Prático:** ${customChallenge}
* **Princípio da Lei do Triunfo:**
  > ${customNapoleonQuote}

Como você se sente com essa formulação para conduzir o alinhamento? Deseja ajustar algum detalhe específico da conversa?`;
    }

    return `### 🎯 Assistente de Feedback Estratégico MasterMind

Entendido, Líder **Padrão-Master ${leaderInfo.id} (${leaderInfo.name})**.

Para que eu formule o roteiro de feedback sob medida com palavras cirúrgicas:
1. **Qual é o Padrão-Master provável do seu interlocutor (1 a 9)?**
2. **Qual é a situação concreta que você precisa alinhar?** *(Descreva o que ocorreu, os impactos e o desfecho almejado)*

*Assim que você indicar esses pontos, entregarei o diagnóstico relacional e o roteiro completo de comunicação.*`;
  }

  // ==========================================
  // PILAR 2: SOS INTELIGÊNCIA EMOCIONAL
  // ==========================================
  if (pillarId === "sos") {
    let mirroring = "";
    let emergencyAction1 = leaderInfo.sosActions[0];
    let emergencyAction2 = leaderInfo.sosActions[1];
    let customNapoleonQuote = `"O homem que não consegue controlar as suas próprias emoções jamais poderá controlar as circunstâncias ao seu redor." — Napoleon Hill`;

    if (sit.isContractLossOrCrisis) {
      mirroring = `Compreendo profundamente a tempestade emocional que uma perda de contrato ou crise de grande porte provoca. A sensação de peso nas costas, a preocupação imediata com o fluxo de caixa, a folha de pagamento e a reação do time são absolutamente naturais. Porém, agora é o momento exato em que a sua liderança será testada naquilo que Napoleon Hill chamava de 'Autodomínio Inabalável'.`;
      emergencyAction1 = `**Contenção da Catastrofização Mental:** Respire fundo. Não fale com a equipe tomado pelo desespero. Escreva em uma folha: '1) Qual é o impacto real e mensurável hoje? 2) Quais são 3 ações imediatas de corte de despesas não essenciais ou aceleração de novos negócios?'`;
      emergencyAction2 = `**Comunicação de Firmeza e Segurança:** Ao reunir o time, adote uma postura de general em campo: reconheça a perda com sobriedade, assuma o comando do plano de contingência e distribua metas claras para os próximos 7 dias.`;
      customNapoleonQuote = `"Toda adversidade carrega dentro de si a semente de uma vantagem equivalente ou muito superior." — Napoleon Hill`;
    } else if (sit.isConflict) {
      mirroring = `Reconheço a intensidade e o calor desse atrito interpessoal. Quando o ego entra em combustão, a primeira vítima é o discernimento executivo. Agir no ápice da raiva ou da mágoa gerará feridas relacionais que demandarão meses para cicatrizar.`;
      emergencyAction1 = `**Pausa Tática de 10 Minutos Sem Reação Verbal:** Não envie áudios, e-mails ou mensagens textuais agora. Declare: *"Vou analisar os fatos com a devida profundidade e retorno nosso alinhamento às [horário definido]"*.`;
      emergencyAction2 = `**Desconexão de Reatividade:** Pergunte-se com rigor: 'Esta conversa é para alimentar o meu ego de ${leaderInfo.emotionalVice} ou para proteger o propósito maior da empresa?'`;
    } else {
      mirroring = `Compreendo o nível de pressão e exigência que este momento crítico está demandando de você (*'${sit.rawExtract}'*). A liderança de excelência não consiste na ausência de turbulências, mas na serenidade com que você comanda o leme durante a tempestade.`;
      emergencyAction1 = `**Desarme da Culpa e Foco em Solução:** Convoque sua virtude de **${leaderInfo.virtue}** e pergunte: *"O fato está consumado; qual é o plano de contenção para os próximos 60 minutos?"*.`;
      emergencyAction2 = `**Isolamento do Problema:** Não permita que uma falha operacional contamine a sua autoconfiança no restante das suas decisões de hoje.`;
    }

    return `### 🛡️ SOS Inteligência Emocional MasterMind

**Líder em Comando:** Padrão-Master ${leaderInfo.id} (${leaderInfo.name} — ${leaderInfo.subtitle})
**Gatilho Identificado:** ${sit.theme.toUpperCase()}
**Vício Emocional Ativado:** **${leaderInfo.emotionalVice}**
**Virtude Mestra a Resgatar Imediatamente:** **${leaderInfo.virtue}**

---

#### 🤝 1. Acolhimento & Espelhamento da Pressão:
${mirroring}

---

#### 🔍 2. Diagnóstico do Momento de Pressão:
Diante do incidente relatado (*'${sit.rawExtract || "momento de alta turbulência"}'*), o seu Padrão-Master ${leaderInfo.id} tende a reagir ativando a fixação de *${leaderInfo.mentalFixation}*. A mente sob estresse perde a visão panorâmica. Seu objetivo agora é resgatar o centro de gravidade interno antes de emitir qualquer ordem.

---

#### 🚨 3. Duas Ações Práticas Imediatas de Autodomínio:
1. ${emergencyAction1}
2. ${emergencyAction2}

---

#### 💡 4. Atitude Mental de Cura Napoleon Hill:
> *"${leaderInfo.healingAttitude}"*

---

#### 🌬️ 5. Exercício de Centralização Fisiológica (Técnica 4-2-6):
* **Inspire pelo nariz em 4 segundos:** Conecte-se com a virtude da **${leaderInfo.virtue}** e clareza executiva.
* **Retenha o ar por 2 segundos:** Afirme internamente sua soberania e equilíbrio emocional.
* **Expire suavemente pela boca em 6 segundos:** Expulse a tensão, o desespero e a reatividade de *${leaderInfo.emotionalVice}*.

> ${customNapoleonQuote}

Como você percebe a sua serenidade e foco agora para dar o próximo direcionamento com sabedoria?`;
  }

  // ==========================================
  // PILAR 3: BÚSSOLA DIÁRIA DE VIRTUDES
  // ==========================================
  let activityContextSection = "";
  let specificChallenge = `Diante do seu compromisso (*${lastUserMsg.slice(0, 110) || "suas principais decisões e reuniões do dia"}*), tome a decisão deliberada de agir pela virtude de **${leaderInfo.virtue}**, gerando uma aliança MasterMind exemplar.`;

  if (sit.isBNI) {
    activityContextSection = `#### 🌐 Contexto Estratégico: Reunião do BNI (Business Network International)
* **A Dinâmica do BNI:** O BNI baseia-se na filosofia **"Givers Gain" (Ganhar Doando / Contribuir para Receber)**. O pitch semanal de 30 a 60 segundos exige síntese, clareza cirúrgica e um pedido de referência extremamente específico.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id} (${leaderInfo.name}):** ${
      leaderInfo.id === 7
        ? "Como Entusiasta (Padrão-Master 7), seu magnetismo é contagiante, mas o risco é tentar falar de tudo e perder o foco. Aplique a virtude da **Sobriedade e Foco**: apresente um único case específico e faça um pedido claro de conexão."
        : leaderInfo.id === 3
        ? "Como Realizador (Padrão-Master 3), seu pitch é impecável. Cuide para não soar puramente transacional; demonstre como seu trabalho resolve a dor dos clientes dos seus parceiros de grupo."
        : leaderInfo.id === 8
        ? "Como Desafiador (Padrão-Master 8), sua presença impõe autoridade. Use sua força para transmitir confiabilidade e proteção aos negócios dos outros membros."
        : leaderInfo.id === 1
        ? "Como Perfeccionista (Padrão-Master 1), sua credibilidade é máxima. Pratique a virtude da **Serenidade** para acolher e gerar conexões empáticas sem exigir perfeição formal dos outros membros."
        : `Utilize a virtude de **${leaderInfo.virtue}** para posicionar sua autoridade e criar alianças de alto valor.`
    }

---
`;
    specificChallenge = `No seu pitch de negócios e nas conversas 1a1 do BNI de hoje, aplique a virtude da **${leaderInfo.virtue}**, ouvindo com atenção genuína como você pode gerar referências qualificadas para outros parceiros antes de pedir referências para si.`;
  } else if (sit.isChangeManagement) {
    activityContextSection = `#### 🔄 Contexto Estratégico: Treinamento de Gestão da Mudança
* **A Dinâmica da Transformação:** A resistência humana ao novo é quebrada pelo propósito inspirador e pela escuta empática, não pela imposição burocrática.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Utilize a virtude de **${leaderInfo.virtue}** para acolher os receios do grupo e conduzi-los com segurança e entusiasmo sereno.

---
`;
    specificChallenge = `Na abertura da sua condução, dedique os primeiros 10 minutos para validar os sentimentos da equipe diante da mudança, garantindo que todos se sintam ouvidos antes de apresentar o novo fluxo.`;
  } else if (sit.isFamilyFinances) {
    activityContextSection = `#### 🏡 Contexto Estratégico: Alinhamento de Finanças Familiares
* **A Dinâmica no Casamento:** As finanças familiares exigem comunhão de valores, respeito mútuo e clareza de longo prazo, eliminando o tom de auditoria ou acusação.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Utilize a virtude de **${leaderInfo.virtue}** para construir um pacto de prosperidade a dois com leveza e carinho.

---
`;
    specificChallenge = `Realizar um alinhamento sereno com seu cônjuge com foco exclusivo nos projetos e sonhos da família para os próximos 12 meses, acordando um orçamento compartilhado sem cobranças de erros passados.`;
  } else if (sit.isOneOnOne) {
    activityContextSection = `#### 👥 Contexto Estratégico: Reunião 1on1
* **A Dinâmica Executiva:** Espaço sagrado de escuta ativa profunda (80% liderado, 20% líder) para remover impedimentos e inspirar desenvolvimento.
* **Aplicação ao seu Padrão-Master ${leaderInfo.id}:** Pratique a virtude de **${leaderInfo.virtue}**, oferecendo presença plena e suporte genuíno.

---
`;
    specificChallenge = `Conduzir o 1on1 fazendo pelo menos 3 perguntas abertas de reflexão ('Qual foi seu maior aprendizado nesta semana?', 'Onde posso te apoiar para desbloquear seus resultados?') sem interromper o liderado.`;
  }

  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão-Master ${leaderInfo.id}:** ${leaderInfo.name} (${leaderInfo.subtitle})
**Virtude Farol do Dia:** **${leaderInfo.virtue}**
**Armadilha a Neutralizar:** *${leaderInfo.mentalFixation}* (${leaderInfo.emotionalVice})

---

${activityContextSection}#### 📜 Pílula de Sabedoria Estratégica Napoleon Hill:
> *"${leaderInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${leaderInfo.turningPoint}
* **Aplicação na sua Agenda de Hoje:** ${specificChallenge}

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

    // Try primary high-performance model (gemini-2.5-flash) with Google Search grounding tool
    try {
      const response = await generateWithTimeout(
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: [{ googleSearch: {} }],
          },
        }),
        35000
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
    } catch (primaryErr: any) {
      console.log("Primary model with search failed, trying fallback model (gemini-3.8-flash):", primaryErr?.message || primaryErr);
      try {
        const fallbackAiResponse = await generateWithTimeout(
          ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          30000
        );
        responseText = fallbackAiResponse.text || "";
      } catch (secErr: any) {
        console.log("Fallback AI model error, using hyper-personalized MasterMind engine:", secErr?.message || secErr);
        responseText = generateLocalMentorResponse(pillarId, messages, userEnneatype, peerEnneatype);
      }
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
