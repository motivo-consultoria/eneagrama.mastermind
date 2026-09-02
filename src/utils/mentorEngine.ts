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

  // If user is selecting an enneatype or providing business/team context, it's NOT off-topic
  if (/(?:tipo|padr[ãa]o|eneatipo)\s*[1-9]/i.test(lower)) return false;
  if (/(?:lider|equipe|reuni[ãa]o|feedback|gest[aã]o|conflito|press[aã]o|meta|bni|1on1|diretoria|estresse|demiss|contrat|desempenho|relat[oó]rio)/i.test(lower)) return false;

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
 * Extracts enneatype numbers mentioned in text if not explicitly chosen
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
 * Generates an executive mentor response based on Napoleon Hill's MasterMind philosophy
 * and the 9 Enneagram Leadership Patterns.
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
      messages.find((m) => m.role === "user" && /meu padr[ãa]o|sou tipo|tipo\s*[1-9]/i.test(m.content))?.content || ""
    ) ||
    detectEnneatypeFromText(conversationText) ||
    1;

  const resolvedPeerType =
    peerType ||
    detectEnneatypeFromText(
      messages.find((m) => m.role === "user" && /liderado|outra pessoa|pessoa envolvida|tipo\s*[1-9]/i.test(m.content))?.content || ""
    ) ||
    (pillarId === "feedback" ? 3 : null);

  const userInfo: EnneatypeInfo = ENNEAGRAM_TYPES[resolvedUserType] || ENNEAGRAM_TYPES[1];
  const peerInfo: EnneatypeInfo | null = resolvedPeerType ? ENNEAGRAM_TYPES[resolvedPeerType] || ENNEAGRAM_TYPES[3] : null;

  // 1. PILAR: FEEDBACK ESTRATÉGICO
  if (pillarId === "feedback") {
    if (peerInfo) {
      return `### 🎯 Roteiro de Feedback Executivo MasterMind

**Líder:** Tipo ${userInfo.id} (${userInfo.name}) • Virtude a manifestar: **${userInfo.virtue}**
**Liderado:** Tipo ${peerInfo.id} (${peerInfo.name}) • Fixação do Liderado: *${peerInfo.mentalFixation}*

---

#### 1. Dinâmica Relacional & Diagnóstico Comportamental
* **Seu Desafio como Líder (Tipo ${userInfo.id}):** ${userInfo.feedbackAdviceAsLeader}
* **O que o Liderado (Tipo ${peerInfo.id}) precisa ouvir:** ${peerInfo.feedbackAdviceAsSubordinate}
* **Gatilhos de Defesa a EVITAR TERMINANTEMENTE:** ${peerInfo.communicationTriggersToAvoid.join(" • ")}.

---

#### 2. Roteiro Executivo de 3 Passos (Palavras Sugeridas):

1. **Abertura com Confiança e Vínculo (Rapport Inicial):**
   > *"Quero começar destacando o quanto valorizo seu empenho e sua contribuição com a equipe. Nosso objetivo comum é o crescimento contínuo e elevar a régua dos nossos resultados com respeito e clareza."*

2. **Apresentação de Fatos Objetivos (Sem Julgamento Pessoal):**
   > *"Analisei a situação recente sobre '${lastUserMessage.replace(/\n/g, " ").slice(0, 120)}...' e gostaria de alinhar como podemos otimizar esse processo. Como você mesmo avalia o impacto disso na entrega final?"*

3. **Pacto de Ação & Compromisso Mútuo:**
   > *"Com base na sua virtude de ${peerInfo.virtue}, qual é a melhor solução prática que você propõe para ajustarmos isso a partir de hoje? Vamos estabelecer uma meta clara e revisar juntos."*

---

#### 3. Princípio de Alta Performance Napoleon Hill:
> *"Um líder extraordinário não busca vencer discussões, mas inspirar homens e mulheres a atingirem seu potencial máximo com propósito definido e autodomínio."*

Deseja refinar alguma frase específica para adaptar ao momento da conversa?`;
    }

    return `### 🎯 Assistente de Feedback Estratégico MasterMind

**Líder Tipo ${userInfo.id} (${userInfo.name})** registrado com sucesso.

Para que eu formule o roteiro de palavras exatas com máxima precisão:
1. **Qual é o Eneatipo provável do liderado (1 a 9)?**
2. **Qual é a situação concreta que precisa de alinhamento?**

*Assim que você indicar, entregarei os gatilhos a evitar e a estrutura completa da conversa.*`;
  }

  // 2. PILAR: SOS INTELIGÊNCIA EMOCIONAL
  if (pillarId === "sos") {
    return `### 🛡️ SOS Inteligência Emocional MasterMind

**Líder em Comando:** Tipo ${userInfo.id} (${userInfo.name} - ${userInfo.subtitle})
**Vício Emocional Ativado sob Estresse:** **${userInfo.emotionalVice}**
**Virtude Mestra a Resgatar:** **${userInfo.virtue}**

---

#### 🚨 2 Ações Práticas Imediatas de Autodomínio:
1. **${userInfo.sosActions[0]}**
2. **${userInfo.sosActions[1]}**

---

#### 💡 Atitude Mental de Cura (Napoleon Hill):
> *"${userInfo.healingAttitude}"*

---

#### 🌬️ Exercício de Centralização Executiva (Técnica dos 3 Tempos):
* Inspire profundamente pelo nariz contando até **4** (trazendo clareza mental).
* Retenha o ar com firmeza por **2** tempos (afirmando seu comando interno).
* Expire suavemente pela boca em **6** tempos, dissolvendo a tensão de *${userInfo.emotionalVice}*.

> *"O autodomínio é a primeira e mais importante vitória que qualquer líder pode conquistar na vida."* — Napoleon Hill

Como você percebe sua energia agora para dar o próximo direcionamento com serenidade?`;
  }

  // 3. PILAR: BÚSSOLA DIÁRIA DE VIRTUDES
  const fullContextText = (conversationText + " " + lastUserMessage).toLowerCase();
  let activityContextSection = "";

  if (fullContextText.includes("bni") || fullContextText.includes("business network")) {
    activityContextSection = `#### 🌐 Contexto Estratégico da Atividade: Reunião do BNI (Business Network International)
* **A Dinâmica do BNI:** O BNI é o maior grupo de networking profissional e referências estruturadas de negócios do mundo. Sua filosofia central é o **"Givers Gain" (Ganhar Conquistando / Doar para Receber)**.
* **Momentos Críticos:** O pitch de apresentação rápida (30 a 60 segundos), a pontualidade rigorosa e a troca de referências qualificadas de negócios.
* **Conexão com seu Padrão (Tipo ${userInfo.id}):** ${
      userInfo.id === 7
        ? "Como Entusiasta (Tipo 7), seu magnetismo e carisma são contagiantes no networking. Porém, a armadilha é a dispersão de ideias ou tentar vender tudo ao mesmo tempo no pitch. Sua virtude da **Sobriedade e Foco** é a chave para ser cirúrgico, objetivo e transmitir solidez inabalável aos parceiros."
        : userInfo.id === 3
        ? "Como Realizador (Tipo 3), você brilha em apresentações de alto impacto. A armadilha é parecer puramente transacional. Conecte-se com o valor genuíno que você gera para os colegas de grupo."
        : userInfo.id === 8
        ? "Como Desafiador (Tipo 8), sua presença impõe respeito. Cuide para que sua autoridade não intimide novos membros; mostre-se como um parceiro leal e protetor de negócios."
        : `Utilize sua virtude de **${userInfo.virtue}** para construir relações de confiança profunda e mútua geração de valor.`
    }

---
`;
  } else if (conversationText.includes("1on1") || conversationText.includes("um a um") || conversationText.includes("alinhamento individual")) {
    activityContextSection = `#### 👥 Contexto Estratégico da Atividade: Reunião 1on1
* **A Dinâmica do 1on1:** Espaço de escuta ativa, desenvolvimento e alinhamento de expectativas mútuas.
* **Conexão com seu Padrão (Tipo ${userInfo.id}):** Lidere pelo exemplo, aplicando a virtude de **${userInfo.virtue}** para gerar segurança e clareza.

---
`;
  } else if (conversationText.includes("diretoria") || conversationText.includes("conselho") || conversationText.includes("board")) {
    activityContextSection = `#### 🏛️ Contexto Estratégico da Atividade: Reunião de Diretoria / Conselho
* **A Dinâmica Executiva:** Exige alta capacidade de síntese, clareza métrica, governança e alinhamento de visão estratégica.
* **Conexão com seu Padrão (Tipo ${userInfo.id}):** Utilize a virtude de **${userInfo.virtue}** para direcionar decisões de alto impacto com serenidade e firmeza.

---
`;
  }

  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão ${userInfo.id}:** ${userInfo.name} (${userInfo.subtitle})
**Virtude Farol do Dia:** **${userInfo.virtue}**
**Armadilha a Contornar:** *${userInfo.mentalFixation}* (${userInfo.emotionalVice})

---

${activityContextSection}#### 📜 Pílula de Sabedoria Estratégica Napoleon Hill:
> *"${userInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${userInfo.turningPoint}
* **Aplicação Concreta:** Diante de sua prioridade de hoje (*${lastUserMessage.slice(0, 100) || "suas principais decisões"}*), tome uma decisão deliberada ancorada na virtude de **${userInfo.virtue}**, gerando uma aliança MasterMind sólida e inspirando sua equipe pelo exemplo.

---

> *"Defina o seu objetivo principal com clareza inabalável e coloque sua maior virtude a serviço da realização desse propósito."* — Napoleon Hill

Qual será o primeiro passo que você dará hoje para materializar esse desafio?`;
}
