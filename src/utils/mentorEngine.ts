import { ENNEAGRAM_TYPES, EnneatypeInfo } from "../data/enneagramData";

export interface MentorContext {
  pillarId: "feedback" | "sos" | "bussola";
  userEnneatype?: number | null;
  peerEnneatype?: number | null;
  messages: Array<{ role: string; content: string }>;
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
  return `### 🧭 Bússola Diária de Virtudes MasterMind

**Líder Padrão ${userInfo.id}:** ${userInfo.name} (${userInfo.subtitle})
**Virtude Farol do Dia:** **${userInfo.virtue}**
**Armadilha a Contornar:** *${userInfo.mentalFixation}* (${userInfo.emotionalVice})

---

#### 📜 Pílula de Sabedoria Estratégica:
> *"${userInfo.dailyVirtueGuidance}"*

---

#### ⚡ Desafio Prático de Liderança de 24 Horas:
* **Foco da Missão:** ${userInfo.turningPoint}
* **Aplicação Concreta:** Diante de sua prioridade de hoje (*${lastUserMessage.slice(0, 100) || "suas principais decisões"}*), tome uma decisão deliberada ancorada na virtude de **${userInfo.virtue}**, delegando com confiança e inspirando sua equipe pelo exemplo.

---

> *"Defina o seu objetivo principal com clareza inabalável e coloque sua maior virtude a serviço da realização desse propósito."* — Napoleon Hill

Qual será o primeiro passo que você dará hoje para materializar esse desafio?`;
}
