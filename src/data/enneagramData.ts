export interface EnneatypeInfo {
  id: number;
  name: string;
  subtitle: string;
  virtue: string;
  emotionalVice: string;
  mentalFixation: string;
  wound: string;
  woundDescription: string;
  worldview: string;
  typicalPhrases: string[];
  healingAttitude: string;
  turningPoint: string;
  leadershipStyle: string;
  communicationGifts: string[];
  communicationTriggersToAvoid: string[];
  feedbackAdviceAsLeader: string;
  feedbackAdviceAsSubordinate: string;
  sosActions: [string, string];
  dailyVirtueGuidance: string;
}

export const ENNEAGRAM_TYPES: Record<number, EnneatypeInfo> = {
  1: {
    id: 1,
    name: "Perfeccionista",
    subtitle: "Ética e Perfeição",
    virtue: "Serenidade & Sabedoria (Discernimento)",
    emotionalVice: "Raiva / Ira reprimida (Ressentimento)",
    mentalFixation: "Ressentimento / Julgamento",
    wound: "Traição / Imperfeição",
    woundDescription: "Atitude autossuficiente, não confiando na orientação vinda de fora; medo de ser corrupto ou imperfeito.",
    worldview: "O mundo é imperfeito e estou aqui para corrigi-lo. Preciso ser bom e correto para ser merecedor.",
    typicalPhrases: [
      "Eu me comporto de acordo com o meu código interno.",
      "Se não puder ser bem feito, melhor não fazer.",
      "Quando quero algo bem feito, eu mesmo faço."
    ],
    healingAttitude: "Essa pessoa pode ter razão. Talvez outra pessoa tenha uma ideia melhor. É possível que os demais aprendam por si mesmos.",
    turningPoint: "Confronto com as próprias limitações. Aceitar a imperfeição da vida e a beleza do processo.",
    leadershipStyle: "Líder estruturado, focado em altos padrões de qualidade, ética inegociável, processos claros e consistência.",
    communicationGifts: [
      "Clareza de critérios e transparência",
      "Compromisso exemplar com a palavra e a ética",
      "Capacidade de refinamento e organização de equipes"
    ],
    communicationTriggersToAvoid: [
      "Críticas genéricas ou desestruturadas sem embasamento de fatos",
      "Sensação de desleixo, descuido ou injustiça",
      "Ser acusado de agir de má-fé ou cometer erro moral"
    ],
    feedbackAdviceAsLeader: "Cuidado para não usar tom acusatório ('deveria', 'tem que'). Elogie o esforço e a intenção antes de apontar pontos de ajuste. Lembre-se que o ótimo é inimigo do bom.",
    feedbackAdviceAsSubordinate: "Apresente fatos objetivos, reconheça seu empenho e mostre respeito pelos padrões. Peça a perspectiva dele antes de propor a solução.",
    sosActions: [
      "Respire fundo e solte a necessidade de controle absoluto: declare conscientemente 'Fiz o meu melhor possível dentro do contexto'.",
      "Distinga erro técnico de falha de caráter: acolha o que não está perfeito e foque em um único próximo passo prático com serenidade."
    ],
    dailyVirtueGuidance: "Pratique a Serenidade. Permita-se aceitar que o progresso real é feito de iterações e aprendizado, não de perfeição estática."
  },
  2: {
    id: 2,
    name: "Auxiliador",
    subtitle: "Amor e Ajuda",
    virtue: "Humildade & Amor Incondicional (Autocuidado)",
    emotionalVice: "Orgulho (Incapacidade de reconhecer próprias necessidades e limites)",
    mentalFixation: "Adulação / Dependência afetiva",
    wound: "Não merecer ser amado pelo que é",
    woundDescription: "Atitude inconsciente: 'Não confio que serei amado sendo eu mesmo, preciso fazer algo para ser aceito.'",
    worldview: "Preciso ajudar e tomar conta de todos. Devo fazer pelos outros para ter direito a aprovação e afeto.",
    typicalPhrases: [
      "Ajudar as pessoas é maravilhoso!",
      "Sinto que faço mais pelos outros do que por mim mesmo.",
      "Por acaso você não percebe o quanto me dedico a você?"
    ],
    healingAttitude: "Talvez eu deva deixar o outro fazer. Essa pessoa já me dá o seu melhor à sua maneira. Podia fazer algo por mim também.",
    turningPoint: "Contato profundo com os próprios sentimentos, desejos e necessidades legítimas.",
    leadershipStyle: "Líder empático, incentivador, construtor de relacionamentos calorosos e guardião do clima da equipe.",
    communicationGifts: [
      "Sensibilidade aguçada para o estado emocional do liderado",
      "Disposição genuína para apoiar e destravar caminhos",
      "Capacidade de motivar e gerar sensação de pertencimento"
    ],
    communicationTriggersToAvoid: [
      "Frieza emocional excessiva ou desdém pela sua dedicação",
      "Sentir-se descartável ou desvalorizado em seu esforço humano",
      "Críticas públicas ou falta de agradecimento sincero"
    ],
    feedbackAdviceAsLeader: "Não faça rodeios excessivos para poupar os sentimentos do outro. Seja direto com respeito e estabeleça limites saudáveis sem assumir a tarefa do liderado.",
    feedbackAdviceAsSubordinate: "Inicie reforçando a importância do relacionamento e valorize sua dedicação pessoal antes de tratar das demandas técnicas.",
    sosActions: [
      "Pause imediatamente a dedicação aos outros e pergunte a si mesmo: 'O que EU estou precisando neste exato minuto?'",
      "Abaixe a guarda e pratique a Humildade pedindo apoio ou delegando uma tarefa sem exigir nada em troca."
    ],
    dailyVirtueGuidance: "Pratique a Humildade e o Autocuidado. Seu valor como líder não reside em ser indispensável, mas em capacitar os outros a serem autônomos."
  },
  3: {
    id: 3,
    name: "Realizador",
    subtitle: "Desempenho e Sucesso",
    virtue: "Autenticidade & Verdade",
    emotionalVice: "Vaidade / Autoengano (Hipnotizado pela própria imagem e metas)",
    mentalFixation: "Mentira / Ilusão de que somos apenas o papel profissional",
    wound: "Fracassar ou ser rejeitado por ineficiência",
    woundDescription: "Busca importância e reconhecimento por meio de atos e planos: 'Eu sou importante se realizei tal projeto.'",
    worldview: "O mundo só valoriza os bem-sucedidos. Preciso realizar, bater metas e ter sucesso para ser reconhecido.",
    typicalPhrases: [
      "Ir a essa reunião pode me servir para alcançar meus objetivos.",
      "Quando estou inativo, parece que estou morto.",
      "Meu maior orgulho é ter feito deste projeto um sucesso!"
    ],
    healingAttitude: "Talvez eu não necessite ser o melhor o tempo todo. É possível que me aceitem como sou. O que pensam de mim não define quem eu sou.",
    turningPoint: "Confronto sereno com a vulnerabilidade e o fracasso, resgatando a essência interior acima da performance exterior.",
    leadershipStyle: "Líder dinâmico, hiper-focado em metas, pragmático, excelente comunicador e orientador para resultados rápidos.",
    communicationGifts: [
      "Foco inabalável em entregas de alto impacto",
      "Comunicação persuasiva e energizante",
      "Capacidade de simplificar caminhos para vencer obstáculos"
    ],
    communicationTriggersToAvoid: [
      "Reuniões lentas sem pauta clara ou objetivo tangível",
      "Sensação de que sua competência ou prestígio está sendo diminuído",
      "Exposição de falhas na frente de stakeholders ou equipe"
    ],
    feedbackAdviceAsLeader: "Lembre-se de que pessoas não são máquinas de entrega. Conecte-se com as pessoas antes de cobrar números e valorize o processo além do resultado.",
    feedbackAdviceAsSubordinate: "Apresente métricas claras, mostre como o ajuste vai aumentar a eficiência do projeto e respeite seu tempo com objetividade.",
    sosActions: [
      "Desconecte-se temporariamente da 'máscara de sucesso': respire e reconheça o que você realmente sente (cansaço, frustração ou medo).",
      "Priorize a Verdade interna: alinhe com a equipe o cenário real sem maquiar os desafios, cultivando autenticidade imediata."
    ],
    dailyVirtueGuidance: "Pratique a Autenticidade. Liderança de alta performance nasce de quem você é com integridade, não apenas dos troféus que exibe."
  },
  4: {
    id: 4,
    name: "Idealista / Romântico",
    subtitle: "Originalidade e Sensibilidade",
    virtue: "Equanimidade & Equilíbrio Emocional",
    emotionalVice: "Inveja (Sensação de vazio ou de que algo vital lhe falta)",
    mentalFixation: "Melancolia / Foco na ausência",
    wound: "Perda, abandono e incompreensão",
    woundDescription: "Sentimento de que falta algo fundamental que os outros possuem; tendência a se isolar no drama ou sensação de ser diferente.",
    worldview: "Algo fundamental está faltando e os outros têm esse algo. Preciso encontrar o que é único e ideal para ser pleno.",
    typicalPhrases: [
      "Sou extremamente sensível e intuitivo.",
      "Ninguém compreende a verdadeira profundidade deste projeto.",
      "Nada no presente me satisfaz totalmente como o ideal imaginado."
    ],
    healingAttitude: "Não há nada de errado comigo. Os outros também têm suas lutas. O presente contém tudo o que preciso agora.",
    turningPoint: "Ligar-se firmemente no momento presente através da ação prática, disciplinada e objetiva.",
    leadershipStyle: "Líder criativo, com profunda visão estética e estratégica, capaz de intuir tendências e valorizar a singularidade de cada membro.",
    communicationGifts: [
      "Intuição refinada para dinâmicas humanas e nuances sutis",
      "Capacidade de dar significado profundo e propósito à missão",
      "Acolhimento sincero das dores e crises da equipe"
    ],
    communicationTriggersToAvoid: [
      "Tratamento burocrático, genérico ou superficial",
      "Invalidar suas emoções chamando de 'drama' ou 'exagero'",
      "Ambientes padronizados e sem espaço para identidade própria"
    ],
    feedbackAdviceAsLeader: "Evite deixar seu humor flutuar a gestão do time. Seja consistente nas diretrizes e mantenha o foco nas ações concretas em vez de idealizações.",
    feedbackAdviceAsSubordinate: "Reconheça a originalidade e o toque pessoal de sua contribuição antes de apontar alinhamentos práticos de prazos.",
    sosActions: [
      "Ancore-se no corpo e no momento presente através de 5 respirações lentas, desidentificando-se do turbilhão emocional temporário.",
      "Execute uma tarefa concreta e prática agora, focando naquilo que você JÁ TEM e nas vitórias concretas do dia."
    ],
    dailyVirtueGuidance: "Pratique a Equanimidade. Mantenha seu centro equilibrado mesmo quando as águas emocionais se agitarem, canalizando sensibilidade em criação concreta."
  },
  5: {
    id: 5,
    name: "Observador",
    subtitle: "Sabedoria e Domínio",
    virtue: "Desprendimento & Sabedoria (Engajamento)",
    emotionalVice: "Avareza (Retenção de tempo, conhecimento, emoções e energia)",
    mentalFixation: "Mesquinhez / Isolamento analítico",
    wound: "Desconfiança e invasão",
    woundDescription: "Sensação de que o mundo exige muito e oferece pouco; medo de esgotamento e de parecer tolo ou despreparado.",
    worldview: "O mundo é invasor e caótico. Preciso de conhecimento, autonomia e privacidade para ser autossuficiente.",
    typicalPhrases: [
      "Há assuntos que só podem ser analisados friamente à luz da razão.",
      "Gosto de estar sozinho no meu canto pensando em silêncio.",
      "Não entendi a lógica da sua pergunta, explique com precisão."
    ],
    healingAttitude: "Quem sabe eu posso confiar nas pessoas e deixá-las saber do que necessito. O mundo tem recursos suficientes para mim.",
    turningPoint: "Engajamento ativo e compromisso concreto no mundo real, saindo da mente para a interação generosa.",
    leadershipStyle: "Líder analítico, estratégico, fundamentado em dados, sóbrio sob pressão e mestre em soluções conceituais robustas.",
    communicationGifts: [
      "Análise lúcida e isenta de paixões cegas",
      "Capacidade de síntese e resolução lógica de problemas complexos",
      "Respeito absoluto à autonomia dos liderados"
    ],
    communicationTriggersToAvoid: [
      "Cobranças repentinas de manifestações emocionais ou improviso público",
      "Invasão do seu espaço, tempo de reflexão e limites pessoais",
      "Decisões baseadas puramente em impulsos sem embasamento técnico"
    ],
    feedbackAdviceAsLeader: "Não se esconda atrás de e-mails ou relatórios. Ofereça presença humana, compartilhe suas conclusões e expresse reconhecimento caloroso.",
    feedbackAdviceAsSubordinate: "Envie previamente os pontos em tópicos estruturados, dê tempo para ele processar e evite apelos puramente emocionais.",
    sosActions: [
      "Saia da clausura mental e compartilhe com um colega de confiança o que você está pensando ou precisando.",
      "Engaje-se com presença física no ambiente: tome uma ação de liderança visível que mobilize recursos em favor da equipe."
    ],
    dailyVirtueGuidance: "Pratique a Sabedoria Engajada. O conhecimento só se torna poder quando compartilhado e aplicado em prol do bem comum do grupo."
  },
  6: {
    id: 6,
    name: "Cético Leal",
    subtitle: "Lealdade e Segurança",
    virtue: "Coragem & Fé (Autonomia)",
    emotionalVice: "Medo / Ansiedade antecipatória",
    mentalFixation: "Dúvida / Covardia / Desconfiança",
    wound: "Sentir-se desprotegido e desamparado",
    woundDescription: "Incerteza crônica sobre autoridade e intenções ocultas; oscila entre o recuo prudente e o confronto contrafóbico.",
    worldview: "O mundo é instável e ameaçador. Preciso estar sempre vigilante, prever os riscos e construir alianças leais para ter segurança.",
    typicalPhrases: [
      "Isto pode dar errado se não considerarmos este plano de contingência.",
      "Sentir-me seguro com a equipe é essencial para mim.",
      "Sempre demoro a concretizar porque fico mapeando consequências."
    ],
    healingAttitude: "Isto pode dar muito certo. Talvez não seja necessário prever todos os problemas possíveis. Posso confiar no meu discernimento.",
    turningPoint: "Exercício firme da autonomia: arriscar, decidir com coragem e confiar em suas próprias forças.",
    leadershipStyle: "Líder leal, protetor do grupo, estrategista de riscos, agregador de consenso e guardião de procedimentos seguros.",
    communicationGifts: [
      "Detecção precoce de falhas estruturais e riscos de projeto",
      "Lealdade incondicional aos acordos firmados com a equipe",
      "Capacidade de construir redes sólidas de confiança mútua"
    ],
    communicationTriggersToAvoid: [
      "Inconsistências no discurso da liderança ou promessas vagas",
      "Mudanças abruptas de rumo sem justificativa fundamentada",
      "Sensação de conspiração ou informações privilegiadas ocultadas"
    ],
    feedbackAdviceAsLeader: "Cuidado para não transferir sua ansiedade para a equipe em formato de microgerenciamento ou ceticismo paralisante. Foque no que já está dando certo.",
    feedbackAdviceAsSubordinate: "Seja totalmente transparente, ofereça segurança quanto ao seu compromisso e explique o 'porquê' das decisões antes do 'como'.",
    sosActions: [
      "Questione conscientemente o cenário catastrófico: 'E se der tudo incrivelmente certo? O que a Coragem faria agora?'",
      "Tome uma decisão necessária que você vinha adiando por excesso de análise de risco e confie na sua capacidade de resolução."
    ],
    dailyVirtueGuidance: "Pratique a Coragem. A verdadeira segurança não vem de controlar o futuro, mas da certeza interior de que você possui recursos para liderar qualquer cenário."
  },
  7: {
    id: 7,
    name: "Entusiasta",
    subtitle: "Otimismo e Prazer",
    virtue: "Sobriedade & Temperança (Foco e Presença)",
    emotionalVice: "Gula (Desejo insaciável de novas ideias, opções e estímulos prazerosos)",
    mentalFixation: "Planos / Fantasias futuristas",
    wound: "Sofrimento, tédio e aprisionamento",
    woundDescription: "Fuga sistemática de dores, rotinas e limitações através do encantamento por múltiplos projetos simultâneos.",
    worldview: "A vida deve ser alegre, rica em possibilidades e prazer. Preciso manter opções abertas para nunca me limitar ou sofrer.",
    typicalPhrases: [
      "Minha grande paixão são ideias novas e desafios empolgantes.",
      "Não gosto de burocracia ou limites rígidos.",
      "Planejar me dá um prazer gigante; vamos criar conexões inovadoras!"
    ],
    healingAttitude: "Talvez o que eu tenha diante de mim já seja o suficiente. Não estou perdendo nada ao sustentar a profundidade até o final.",
    turningPoint: "Contato com o sentimento real e sustentação do foco e da disciplina até a conclusão.",
    leadershipStyle: "Líder visionário, inspirador, rápido em conexões, criador de atmosfera entusiasmada e desbloqueador de inovações.",
    communicationGifts: [
      "Energia contagiante e capacidade de entusiasmar pessoas",
      "Pensamento lateral e geração de soluções fora da caixa",
      "Otimismo pragmático que transforma crises em oportunidades"
    ],
    communicationTriggersToAvoid: [
      "Rotinas monótonas e detalhes operacionais repetitivos sem fim",
      "Críticas pesadas ou reuniões focadas apenas em lamúrias",
      "Sentir-se encurralado sem autonomia para propor ideias"
    ],
    feedbackAdviceAsLeader: "Não fuja de conversas difíceis mascarando problemas com falsos sorrisos. Aprofunde o alinhamento e acompanhe a execução até a entrega final.",
    feedbackAdviceAsSubordinate: "Apresente os feedbacks associados a oportunidades de inovação futura e defina marcos curtos de entrega para mantê-lo focado.",
    sosActions: [
      "Pare a dispersão: escolha UM único compromisso prioritário em aberto e leve-o até a conclusão sem abrir novas abas ou tarefas.",
      "Respire na Sobriedade: aceite o desconforto passageiro do momento sem tentar escapar mentalmente para o próximo projeto."
    ],
    dailyVirtueGuidance: "Pratique a Sobriedade e a Temperança. A maestria de um líder é revelada não pelo número de projetos que inicia, mas pela profundidade daqueles que finaliza com excelência."
  },
  8: {
    id: 8,
    name: "Contestador / Desafiador",
    subtitle: "Proteção e Justiça",
    virtue: "Inocência & Magnanimidade (Verdadeira Força)",
    emotionalVice: "Luxúria (Intensidade visceral, necessidade de domínio e imposição de força)",
    mentalFixation: "Vingança / Revanche / Confronto",
    wound: "Perda do comando e vulnerabilidade",
    woundDescription: "Sentimento de que o mundo é injusto e apenas os fortes sobrevivem; aversão extrema a ser controlado ou manipulado.",
    worldview: "O mundo é uma selva injusta. Preciso ser forte, impor respeito e proteger os meus para evitar ser subjugado.",
    typicalPhrases: [
      "Quando perco a paciência, vou direto ao ponto!",
      "Procuro ser leal às pessoas; quem pisa na bola comigo perde a moral.",
      "Manda quem pode, obedece quem tem juízo; se for pra fazer, faremos com tudo!"
    ],
    healingAttitude: "É possível que essa pessoa não pretenda se aproveitar de mim. Posso baixar a guarda e deixar meu coração ser tocado.",
    turningPoint: "Contato sincero com a própria vulnerabilidade e fraqueza, transformando agressividade em nobreza protetora.",
    leadershipStyle: "Líder forte, decisivo, destemido diante de crises, guardião dos liderados e impulsionador implacável de resultados.",
    communicationGifts: [
      "Comunicação direta, assertiva e sem meias-palavras",
      "Coragem para tomar decisões impopulares mas necessárias",
      "Defesa inegociável da equipe perante ameaças externas"
    ],
    communicationTriggersToAvoid: [
      "Falsidade, manipulação pelas costas ou rodeios covardes",
      "Sentir que alguém está tentando desafiar sua autoridade de forma desleal",
      "Incompetência disfarçada de desculpas vitimistas"
    ],
    feedbackAdviceAsLeader: "Regule a intensidade da sua voz e postura; o que para você parece firmeza normal pode soar como intimidação destruidora para seu liderado.",
    feedbackAdviceAsSubordinate: "Vá direto ao ponto com coragem, olhe nos olhos, assuma responsabilidade sem desculpas e demonstre firmeza e lealdade.",
    sosActions: [
      "Reduza a velocidade e a força física: solte os ombros e mandíbula, reconhecendo a vulnerabilidade sob a raiva.",
      "Pratique a Magnanimidade: escolha usar sua força para amparar e perdoar em vez de punir ou subjugar."
    ],
    dailyVirtueGuidance: "Pratique a Magnanimidade e a Inocência. O ápice da força de um grande líder não é a sua capacidade de dobrar os outros, mas a sua nobreza em elevá-los."
  },
  9: {
    id: 9,
    name: "Mediador",
    subtitle: "Paz e União",
    virtue: "Ação Correta & Diligência (Presença e Posicionamento)",
    emotionalVice: "Indolência / Preguiça psicológica (Anestesia interior e esquecimento de si)",
    mentalFixation: "Conformismo / Resignação passiva",
    wound: "Perda da referência e separação dolorosa",
    woundDescription: "Sensação de que expressar seus desejos gera atrito e rejeição; adormece as próprias prioridades em prol da paz aparente.",
    worldview: "Não serei valorizado se me impor. Devo harmonizar o ambiente e concordar com os outros para manter a paz.",
    typicalPhrases: [
      "Para que complicar as coisas? Vamos manter o ambiente em paz.",
      "É fácil para mim me adaptar a qualquer tipo de pessoa.",
      "Não gosto de ser pressionado; prefiro chegar a um acordo sem estresse."
    ],
    healingAttitude: "Eu sou capaz de influir decisivamente. Minha voz e minha energia importam. Posso me posicionar com clareza e vigor.",
    turningPoint: "Entrar em contato com os próprios sentimentos, prioridades e raiva reprimida, agindo com firmeza no mundo.",
    leadershipStyle: "Líder conciliador, mestre em construção de consenso, ouvinte compassivo e estabilizador de equipes sob alta tensão.",
    communicationGifts: [
      "Capacidade 360° de compreender múltiplos pontos de vista",
      "Habilidade incomparável de apaziguar conflitos entre liderados",
      "Paciência e acolhimento que geram ambiente seguro"
    ],
    communicationTriggersToAvoid: [
      "Pressão agressiva para decisões imediatas sem tempo de reflexão",
      "Conflitos hostis onde é obrigado a tomar partido abruptamente",
      "Ser desconsiderado nas discussões como se fosse invisível"
    ],
    feedbackAdviceAsLeader: "Não confunda paz com omissão. Adiar conversas difíceis acumula passivos graves na equipe. Posicione-se com clareza e autoridade afetuosa.",
    feedbackAdviceAsSubordinate: "Crie um ambiente acolhedor, faça perguntas abertas específicas para extrair a opinião dele e dê prazos claros para compromissos.",
    sosActions: [
      "Levante-se, movimente o corpo e declare em voz alta: 'Minha prioridade agora é X e eu vou executá-la imediatamente!'.",
      "Tome uma posição clara sobre um tema pendente, sem contemporizar ou ceder apenas para evitar tensão."
    ],
    dailyVirtueGuidance: "Pratique a Ação Correta e a Diligência. A paz duradoura não é a ausência de atrito, mas a presença firme da sua liderança construindo a realidade com propósito."
  }
};

export interface PillarConfig {
  id: "feedback" | "sos" | "bussola";
  title: string;
  subtitle: string;
  badge: string;
  initialMessage: string;
  description: string;
  accentColor: string;
}

export const PILLARS: Record<string, PillarConfig> = {
  feedback: {
    id: "feedback",
    title: "Assistente de Feedback Estratégico",
    subtitle: "Condução de conversas difíceis, alinhamento executivo e influência sem defensiva",
    badge: "Pilar 1",
    initialMessage: "Olá, líder. Sou Napoleon Hill, seu mentor MasterMind. Vamos estruturar uma conversa de feedback cirúrgica e de alto impacto.\n\nPara iniciarmos com precisão, **qual é o seu Eneatipo (ou o padrão em que você mais se reconhece)?**\n*Selecione uma das opções abaixo:*",
    description: "Estruture abordagens cirúrgicas baseadas nos gatilhos e virtudes dos eneatipos envolvidos para obter engajamento imediato.",
    accentColor: "from-amber-600 to-yellow-600"
  },
  sos: {
    id: "sos",
    title: "SOS Inteligência Emocional",
    subtitle: "Auto-gestão imediata, domínio próprio e resgate do eixo em situações de crise",
    badge: "Pilar 2",
    initialMessage: "Olá, líder. Sou Napoleon Hill. Diante de momentos de estresse e pressão, o domínio de si mesmo é o primeiro passo para o comando executivo.\n\nPara identificarmos o gatilho exato ativado, **qual é o seu Eneatipo?**\n*Selecione uma das opções abaixo:*",
    description: "Identifique o vício emocional ativado pelo estresse e aplique 2 ações práticas imediatas para acessar sua virtude.",
    accentColor: "from-red-700 to-rose-600"
  },
  bussola: {
    id: "bussola",
    title: "Bússola Diária de Virtudes",
    subtitle: "Foco diário de alta performance, sabedoria MasterMind e desafio prático de 24h",
    badge: "Pilar 3",
    initialMessage: "Olá, líder. Sou Napoleon Hill. O sucesso diário depende de colocar a sua virtude mestra a serviço dos seus maiores objetivos.\n\nPara calibrarmos sua bússola diária, **qual é o seu Eneatipo?**\n*Selecione uma das opções abaixo:*",
    description: "Cruze seu desafio diário com a virtude mestra do seu eneatipo e receba uma diretriz prática para as próximas 24 horas.",
    accentColor: "from-amber-500 to-red-600"
  }
};
