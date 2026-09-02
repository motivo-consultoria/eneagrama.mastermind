import { ENNEAGRAM_TYPES, EnneatypeInfo, PILLARS } from "../data/enneagramData";

export interface MentorContext {
  pillarId: "feedback" | "sos" | "bussola";
  userEnneatype?: number | null;
  peerEnneatype?: number | null;
  messages: Array<{ role: string; content: string }>;
}

/**
 * Checks if a user message is completely out of scope of the MasterMind leadership & emotional intelligence mentorship.
 */
export function isOffTopicMentorQuery(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  const lower = text.toLowerCase();

  // If user is selecting a pattern or providing business/team context, it's NOT off-topic
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

/**
 * Returns a polite, firm boundary message when a conversation is out of scope.
 */
export function getScopeBoundaryMessage(pillarId: "feedback" | "sos" | "bussola"): string {
  const pillar = PILLARS[pillarId] || PILLARS.feedback;
  return `### ⚠️ Aviso de Escopo da Mentoria MasterMind

Olá, líder! Como seu mentor executivo da **Fundação Napoleon Hill (MasterMind)** e especialista no **Eneagrama Sistêmico Vitruviano**, meu compromisso com você é exclusivamente direcionar desafios de **liderança, inteligência emocional, gestão de pessoas e alta performance**.

> *"Defina seu objetivo com clareza inabalável. A dispersão e a perda de foco em um propósito definido são as principais causas do enfraquecimento do líder."* — Napoleon Hill

Não é possível avançar em conversas ou solicitações que fujam do escopo do pilar atual (**${pillar.title}**).

Por favor, compartilhe um **desafio de liderança**, uma **situação concreta com sua equipe** ou um **contexto de tomada de decisão** para continuarmos sua mentoria com foco e excelência.`;
}

/**
 * Extracts pattern numbers mentioned in text if not explicitly chosen
 */
export function detectEnneatypeFromText(text: string): number | null {
  const match = text.match(/(?:tipo|padr[ãa]o|eneatipo)\s*([1-9])/i) || text.match(/\b([1-9])\b/);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 9) return num;
  }
  return null;
}

/**
 * Analyzes situational keywords to generate deep context-aware dynamic mentorship
 */
function analyzeLocalSituation(text: string) {
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

/**
 * Generates an executive mentor response based on Napoleon Hill's MasterMind philosophy
 * and the 9 Master-Patterns.
 */
export function generateMentorResponse(
  pillarId: "feedback" | "sos" | "bussola",
  messages: Array<{ role: string; content: string }>,
  userType?: number | null,
  peerType?: number | null
): string {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const conversationText = messages.map((m) => m.content).join(" \n");

  // Check for off-scope queries
  if (isOffTopicMentorQuery(lastUserMessage)) {
    return getScopeBoundaryMessage(pillarId);
  }

  // Determine user and peer types either from params or by scanning conversation
  const resolvedUserType =
    userType ||
    detectEnneatypeFromText(
      messages.find((m) => m.role === "user" && /meu padr[ãa]o|sou padr[ãa]o|padrão-master|padrão\s*[1-9]|tipo\s*[1-9]/i.test(m.content))?.content || ""
    ) ||
    detectEnneatypeFromText(conversationText) ||
    1;

  const resolvedPeerType =
    peerType ||
    detectEnneatypeFromText(
      messages.find((m) => m.role === "user" && /liderado|outra pessoa|pessoa envolvida|padrão do liderado|padrão\s*[1-9]|tipo\s*[1-9]/i.test(m.content))?.content || ""
    ) ||
    (pillarId === "feedback" ? 3 : null);

  const userInfo: EnneatypeInfo = ENNEAGRAM_TYPES[resolvedUserType] || ENNEAGRAM_TYPES[1];
  const peerInfo: EnneatypeInfo | null = resolvedPeerType ? ENNEAGRAM_TYPES[resolvedPeerType] || ENNEAGRAM_TYPES[3] : null;

  const sitAnalysis = analyzeLocalSituation(conversationText + " " + lastUserMessage);

  // 1. PILAR: FEEDBACK ESTRATÉGICO
  if (pillarId === "feedback") {
    if (peerInfo) {
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

**Líder em Ação:** Padrão-Master ${userInfo.id} (${userInfo.name}) • Virtude a manifestar: **${userInfo.virtue}**
**Liderado / Interlocutor:** Padrão-Master ${peerInfo.id} (${peerInfo.name}) • Fixação a considerar: *${peerInfo.mentalFixation}*
**Foco da Situação:** ${sitAnalysis.theme.toUpperCase()}

---

#### 1. Diagnóstico Relacional & Dinâmica dos Padrões no Caso Concreto:
* **Seu Desafio como Líder (Padrão-Master ${userInfo.id}):** ${userInfo.feedbackAdviceAsLeader} Ao lidar com esta situação (*${sitAnalysis.theme}*), evite projetar seu vício de *${userInfo.emotionalVice}* e ancore sua autoridade na virtude da **${userInfo.virtue}**.
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

**Líder Padrão-Master ${userInfo.id} (${userInfo.name})** registrado com sucesso.

Para que eu formule o roteiro de palavras exatas com máxima precisão e personalização:
1. **Qual é o Padrão-Master provável do liderado (1 a 9)?**
2. **Qual é a situação concreta que precisa de alinhamento?** *(Conte o ocorrido, impacto e o desfecho esperado)*

*Assim que você indicar, entregarei os gatilhos a evitar e a estrutura cirúrgica completa da conversa.*`;
  }

  // 2. PILAR: SOS INTELIGÊNCIA EMOCIONAL
  if (pillarId === "sos") {
    let emergencyAction1 = userInfo.sosActions[0];
    let emergencyAction2 = userInfo.sosActions[1];
    let contextGuidance = `Diante da pressão relatada (*'${sitAnalysis.rawExtract || "momento de alta turbulência"}'*), o seu Padrão-Master ${userInfo.id} tende a reagir ativando o vício de **${userInfo.emotionalVice}** e a fixação de *${userInfo.mentalFixation}*.`;

    if (sitAnalysis.isConflict || sitAnalysis.isCrisis) {
      emergencyAction1 = `**Pausa Tática de 5 Minutos Sem Reação Verbal:** Não tome decisões nem envie mensagens no calor da discussão. Declare: *"Vou analisar os dados com profundidade e retorno nosso posicionamento às [horário específico]"*.`;
      emergencyAction2 = `**Separação entre Fato e Reação Emocional:** Anote em um papel: 1) O que é fato objetivo inegável? 2) O que é suposição da mente sob o filtro de ${userInfo.emotionalVice}? Responda apenas ao fato.`;
    } else if (sitAnalysis.isError || sitAnalysis.isPerformance) {
      emergencyAction1 = `**Desarme da Culpa e Foco em Solução Imediata:** Respire fundo e convoque sua virtude de **${userInfo.virtue}**. Pergunte à equipe: *"O fato aconteceu; agora, qual é o plano de contingência para os próximos 60 minutos?"*.`;
      emergencyAction2 = `**Isolamento do Problema:** Não permita que o erro em uma área contamine sua autoconfiança no restante das operações do dia.`;
    }

    return `### 🛡️ SOS Inteligência Emocional MasterMind

**Líder em Comando:** Padrão-Master ${userInfo.id} (${userInfo.name} — ${userInfo.subtitle})
**Gatilho Ativado:** ${sitAnalysis.theme.toUpperCase()}
**Vício Emocional Ativado sob Estresse:** **${userInfo.emotionalVice}**
**Virtude Mestra a Resgatar Imediatamente:** **${userInfo.virtue}**

---

#### 🔍 Diagnóstico do Momento de Pressão:
${contextGuidance}
A mente executiva sob estresse tende a perder a visão panorâmica. Seu objetivo agora não é 'vencer a crise' no grito ou na pressa, mas recuperar seu centro de comando interno.

---

#### 🚨 2 Ações Práticas Imediatas de Autodomínio:
1. ${emergencyAction1}
2. ${emergencyAction2}

---

#### 💡 Atitude Mental de Cura (Napoleon Hill):
> *"${userInfo.healingAttitude}"*

---

#### 🌬️ Exercício de Centralização Fisiológica (Técnica 4-2-6):
* **Inspire pelo nariz em 4 segundos:** Conecte-se com a virtude da **${userInfo.virtue}** e clareza mental.
* **Retenha o ar por 2 segundos:** Afirme internamente sua soberania e autodomínio executivo.
* **Expire suavemente pela boca em 6 segundos:** Expulse a tensão, a pressa e a reatividade de *${userInfo.emotionalVice}*.

> *"O autodomínio é a primeira e mais importante vitória que qualquer líder pode conquistar na vida."* — Napoleon Hill

Como você percebe sua energia e serenidade agora para dar o próximo direcionamento com sabedoria?`;
  }

  // 3. PILAR: BÚSSOLA DIÁRIA DE VIRTUDES
  const fullContextText = (conversationText + " " + lastUserMessage).toLowerCase();
  let activityContextSection = "";

  if (fullContextText.includes("bni") || fullContextText.includes("business network")) {
    activityContextSection = `#### 🌐 Contexto Estratégico da Atividade: Reunião do BNI (Business Network International)
* **A Dinâmica do BNI:** O BNI é a maior organização de networking profissional e referências estruturadas de negócios do mundo. Sua filosofia central é o **"Givers Gain" (Ganhar Conquistando / Doar para Receber)**.
* **Momentos Críticos:** O pitch de apresentação rápida (30 a 60 segundos), a pontualidade rigorosa e a troca de referências qualificadas de negócios.
* **Aplicação ao seu Padrão-Master ${userInfo.id} (${userInfo.name}):** ${
      userInfo.id === 7
        ? "Como Entusiasta (Padrão-Master 7), seu magnetismo e carisma são contagiantes no networking. Porém, a armadilha é a dispersão de ideias ou tentar vender tudo ao mesmo tempo no pitch. Sua virtude da **Sobriedade e Foco** é a chave para ser cirúrgico, objetivo e transmitir solidez inabalável aos parceiros."
        : userInfo.id === 3
        ? "Como Realizador (Padrão-Master 3), você brilha em apresentações de alto impacto. A armadilha é parecer puramente transacional. Conecte-se com o valor genuíno que você gera para os colegas de grupo."
        : userInfo.id === 8
        ? "Como Desafiador (Padrão-Master 8), sua presença impõe respeito. Cuide para que sua autoridade não intimide novos membros; mostre-se como um parceiro leal e protetor de negócios."
        : userInfo.id === 1
        ? "Como Perfeccionista (Padrão-Master 1), sua credibilidade e pontualidade são exemplares. Cuidado para não julgar mentalmente o pitch imperfeito dos colegas; use a virtude da **Serenidade** para acolher e gerar pontes de negócios."
        : `Utilize sua virtude de **${userInfo.virtue}** para construir relações de confiança profunda e mútua geração de valor.`
    }

---
`;
  } else if (conversationText.includes("1on1") || conversationText.includes("um a um") || conversationText.includes("alinhamento individual")) {
    activityContextSection = `#### 👥 Contexto Estratégico da Atividade: Reunião 1on1
* **A Dinâmica do 1on1:** Espaço de escuta ativa, desenvolvimento e alinhamento de expectativas mútuas, não apenas checagem de tarefas operacionais.
* **Aplicação ao seu Padrão-Master ${userInfo.id}:** Lidere pelo exemplo, aplicando a virtude de **${userInfo.virtue}** para gerar segurança e clareza.

---
`;
  } else if (conversationText.includes("diretoria") || conversationText.includes("conselho") || conversationText.includes("board")) {
    activityContextSection = `#### 🏛️ Contexto Estratégico da Atividade: Reunião de Diretoria / Conselho
* **A Dinâmica Executiva:** Exige alta capacidade de síntese, clareza métrica, governança e alinhamento de visão estratégica.
* **Aplicação ao seu Padrão-Master ${userInfo.id}:** Utilize a virtude de **${userInfo.virtue}** para direcionar decisões de alto impacto com serenidade e firmeza.

---
`;
  } else if (conversationText.includes("negocia") || conversationText.includes("venda") || conversationText.includes("proposta")) {
    activityContextSection = `#### 💼 Contexto Estratégico da Atividade: Negociação Comercial / Apresentação de Proposta
* **A Dinâmica Executiva:** Negociações de alto valor exigem identificação das reais dores do cliente, geração de valor mútuo e firmeza de condições.
* **Aplicação ao seu Padrão-Master ${userInfo.id}:** Ancore-se na virtude de **${userInfo.virtue}** para manter a serenidade e conduzir a negociação para um pacto Ganha-Ganha exemplar.

---
`;
  }

  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão-Master ${userInfo.id}:** ${userInfo.name} (${userInfo.subtitle})
**Virtude Farol do Dia:** **${userInfo.virtue}**
**Armadilha Comportamental a Neutralizar:** *${userInfo.mentalFixation}* (${userInfo.emotionalVice})

---

${activityContextSection}#### 📜 Pílula de Sabedoria Estratégica Napoleon Hill:
> *"${userInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${userInfo.turningPoint}
* **Aplicação Concreta:** Diante de sua prioridade de hoje (*${lastUserMessage.slice(0, 110) || "suas principais decisões e reuniões"}*), tome uma decisão deliberada ancorada na virtude de **${userInfo.virtue}**, gerando uma aliança MasterMind sólida e inspirando sua equipe pelo exemplo.

---

> *"Defina o seu objetivo principal com clareza inabalável e coloque sua maior virtude a serviço da realização desse propósito."* — Napoleon Hill

Qual será o primeiro passo que você dará hoje para materializar esse desafio?`;
}
