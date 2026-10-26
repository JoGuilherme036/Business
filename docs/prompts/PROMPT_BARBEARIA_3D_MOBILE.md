# PROMPT MESTRE — BARBEARIA AUTORAL, MOBILE, MOTION E 3D

## Como usar

Cole este documento inteiro na IA que implementará o projeto, como Claude Code, Cursor ou Codex. Anexe as imagens de referência quando estiverem prontas. Os campos entre colchetes são configuráveis: não invente dados comerciais para preenchê-los. Este documento é uma especificação de execução, não um pedido de uma imagem do site.

---

## 1. Papel, objetivo e resultado esperado

Atue como uma equipe integrada de direção de arte, UX/UI mobile, desenvolvimento full stack, motion design, computação gráfica e qualidade. Projete e implemente um site completo de barbearia, visualmente autoral, com fotografias, objetos 3D de qualidade, animações coordenadas e agendamento realmente funcional.

O principal dispositivo de acesso será o celular. A experiência deve permitir entender os serviços, conferir preço e duração, escolher um profissional, reservar um horário e encontrar a barbearia com poucos toques.

Prioridades, nesta ordem:

1. Agendamento confiável e navegação acessível.
2. Clareza de serviços, preços, profissionais e localização.
3. Identidade visual memorável e fotografia bem dirigida.
4. Motion e 3D integrados à narrativa.
5. Desempenho consistente em celulares intermediários.

Não entregue apenas uma landing page com botões ilustrativos. Implemente interface pública, fluxo de reservas, gestão administrativa e persistência no servidor. Não declare integrações prontas quando dependerem de credenciais ou configuração externa.

## 2. Informações da barbearia e configuração

Centralize os dados em configuração tipada e em campos editáveis no painel:

- Nome: [NOME DA BARBEARIA].
- Logotipo e identidade: [ARQUIVOS DA MARCA].
- WhatsApp comercial: [DDI + DDD + NÚMERO].
- Telefone, Instagram e e-mail: [CONTATOS].
- Endereço completo, cidade, estado, CEP e coordenadas: [ENDEREÇO].
- Horários semanais, feriados e exceções: [HORÁRIOS].
- Serviços, preços, durações e intervalos de preparação: [CATÁLOGO].
- Profissionais, especialidades, serviços habilitados e disponibilidade: [EQUIPE].
- Política de atrasos, cancelamento e eventual sinal: [POLÍTICAS].
- Fuso horário da unidade: configurar explicitamente; usar America/Sao_Paulo como valor inicial editável, sem presumir que atenda todas as cidades brasileiras.

Na falta de informação, avance com dados de demonstração claramente identificados no ambiente de desenvolvimento. Antes da produção, liste os campos obrigatórios pendentes e impeça a apresentação de informações fictícias como reais. Não invente avaliações, endereço, certificações, disponibilidade ou números de clientes.

## 3. Processo de criação e uso das Skills

Se o ambiente disponibilizar Skills de criação de sites, design, acessibilidade, imagens, implementação e testes, leia e aplique as pertinentes antes de executar. Use a Skill de Sites quando disponível e siga o fluxo suportado pelo ambiente. Não afirme ter usado Skills ou ferramentas que não existem nessa instalação.

Antes de implementar, produza uma síntese curta com:

- Conceito visual e justificativa.
- Jornada principal no celular.
- Mapa das telas e organização dos dados.
- Estratégia de motion, 3D, imagens e carregamento.
- Dependências externas e requisitos para operação real.

Depois dessa síntese, continue a implementação. Faça perguntas apenas quando a resposta bloquear uma decisão essencial; mantenha campos configuráveis para o restante.

Se houver projeto existente, inspecione sua estrutura e preserve funcionalidades úteis. Reestruture a composição visual conforme este briefing, sem apagar dados reais. Não importe automaticamente o layout de projetos anteriores.

## 4. Direção de arte: “Ateliê do Corte”

Use “Ateliê do Corte” como conceito criativo provisório, não como nome comercial obrigatório. A sensação deve ser de um estúdio contemporâneo de cuidado e precisão: editorial de moda masculina, oficina de acabamento e espaço acolhedor.

### Paleta inicial

- Carvão: #151715.
- Marfim: #F3EFE7.
- Verde profundo: #263F36.
- Cobre discreto: #B7764A.
- Cinza de apoio: #74786F.

Use marfim e carvão para o contraste principal. Reserve verde e cobre para hierarquia, interação e materiais. Valide contraste de cada combinação; a paleta não autoriza texto de baixo contraste.

### Tipografia e composição

- Títulos com personalidade editorial, preferencialmente uma fonte condensada de boa leitura.
- Textos e controles com sans-serif neutra e legível.
- No máximo duas famílias, com licença adequada e poucos pesos.
- Escala fluida, margens generosas e ritmo entre zonas densas e áreas de descanso.
- Bordas e divisórias finas, referências a linhas de corte e acabamento.
- Assimetria intencional no desktop; sequência clara e natural no celular.
- Ícones consistentes e discretos. Não usar emojis como identidade visual.

### Evitar

- Hero genérico com título à esquerda, imagem à direita e três cartões abaixo.
- Repetir todas as seções em grades de cards iguais.
- Fundo preto com dourado em tudo como solução automática de “luxo”.
- Gradientes neon, glow excessivo, esferas 3D aleatórias, fumaça e partículas sem função.
- Desenhos de bigodes e tesouras usados como decoração repetitiva.
- Texto gigantesco que esconda o agendamento ou prejudique a leitura.
- Copiar integralmente um template ou declarar originalidade absoluta sem comparação.

Crie variedade por meio de fotografias, listas editoriais, enquadramentos, tipografia e diferentes escalas. A marca deve continuar reconhecível com todas as animações desligadas.

## 5. Usar 21st.dev com curadoria

Consulte https://21st.dev/ e https://21st.dev/community/components para selecionar referências e componentes React adequados.

Procure padrões para navegação mobile, transições de layout, botões, galerias, seletores, drawers, dialogs e microinterações. Se houver integração oficial disponível no ambiente, utilize-a; caso contrário, consulte o catálogo e adapte os componentes acessíveis.

Para cada componente incorporado:

1. Confira o código, a licença e as dependências.
2. Teste comportamento por toque, teclado e leitor de tela.
3. Remova efeitos e dependências que não contribuam para a experiência.
4. Ajuste tipografia, cores, proporções e estados ao design do projeto.
5. Registre origem, autoria/licença e alterações em COMPONENT_SOURCES.md.

Não transforme o site em uma colagem de componentes com estilos incompatíveis. Não copie uma página pronta. Não invente nomes de componentes, comandos de instalação ou acessos realizados. Se o catálogo estiver indisponível, implemente os padrões necessários e relate essa limitação.

## 6. Arquitetura técnica

Use React e TypeScript. Para um projeto novo sem restrições de hospedagem, prefira um framework React com renderização no servidor e suporte a rotas de backend, como Next.js. Se a Skill de Sites ou o repositório exigir outro runtime compatível, siga-o e documente a escolha.

- Tailwind CSS e tokens CSS para estilo consistente.
- Motion for React para transições da interface e coreografia de elementos HTML.
- Three.js como base da cena 3D principal.
- React Three Fiber para integrar Three.js ao React.
- Drei para recursos auxiliares pertinentes à cena.
- Babylon.js para uma experiência 3D separada e opcional de abrir pelo visitante, descrita adiante.
- Formulários com validação acessível; React Hook Form e Zod são opções se compatíveis com o projeto.
- Banco relacional e backend com transações ou mecanismo equivalente para impedir conflitos de reserva.
- Autenticação segura para a equipe e autorização validada no servidor.

Verifique versões estáveis e compatibilidade entre React, React Three Fiber, Three.js e Drei antes de instalar. Não escolha versões alpha apenas por serem mais recentes. Fixe dependências no lockfile.

Não use localStorage como fonte de verdade da agenda. Ele pode guardar preferências e rascunhos sem dados sensíveis. Não crie chaves privadas no frontend.

Organize por domínio: site público, reservas, gestão, mídia, notificações e cenas 3D. Separe lógica de disponibilidade de componentes visuais. Evite um único arquivo gigante e abstrações sem necessidade.

## 7. Página inicial e narrativa visual

### A. Primeira dobra: impacto com ação imediata

Crie uma abertura editorial de camadas: fotografia com direção de arte, nome da marca, chamada curta e um detalhe 3D reconhecível. A composição pode usar um enquadramento que remeta a espelho de barbearia, linhas de precisão e tipografia sobre áreas cuidadosamente reservadas.

Exemplo de texto provisório: “Seu estilo. Nosso cuidado em cada detalhe.” Reescreva conforme a personalidade real da marca, sem frases vazias repetidas.

No mobile, mostrar logo, proposta clara, imagem e botão “Agendar horário” cedo, sem obrigar o visitante a rolar uma tela inteira. Oferecer “Ver serviços” como ação secundária. Não exigir interação com o 3D para acessar o conteúdo.

Não usar tela de abertura longa, preload com contagem artificial ou vídeo obrigatório.

### B. Menu de serviços como peça editorial

Organize serviços em uma lista visual com numeração discreta, nome, descrição curta, duração e preço alinhado. Ao selecionar um serviço, atualizar uma fotografia contextual e abrir o agendamento com a escolha preservada.

Categorias configuráveis: cortes, barba, combinações e cuidados adicionais. Os nomes e valores finais virão do catálogo real.

No celular, todas as informações essenciais devem existir sem hover. Descrições adicionais podem expandir, mantendo preço e duração sempre visíveis. Combos devem informar o que incluem e não prometer descontos inexistentes.

### C. Galeria de resultados

Apresente fotografias com recortes variados, filtros simples e lightbox acessível. Use CSS scroll-snap quando fizer sentido, com botões de navegação e indicação de posição. Permita explorar sem bloquear a rolagem vertical.

Antes/depois só quando houver registros reais correspondentes. Imagens conceituais geradas por IA não podem ser apresentadas como clientes atendidos ou trabalhos executados.

### D. Profissionais

Retratos editoriais, nome, especialidades e botão “Agendar com [nome]”. O botão deve preencher o profissional e exibir apenas serviços e horários compatíveis.

Com um único barbeiro, simplifique a seção e dispense a seleção redundante no fluxo. Não invente biografias ou experiência.

### E. O espaço e a experiência

Mostre ambiente, bancada, cadeira e detalhes reais por fotografias. Texto curto sobre atendimento e comodidades comprovadas. Insira o acesso à experiência “Explorar em 3D”, sem torná-la necessária para entender o espaço.

### F. Confiança

Avaliações reais com autorização/origem ou integração configurada. Se faltarem, oculte a seção. Não gere estrelas, depoimentos, logotipos de clientes ou indicadores falsos.

### G. Localização e fechamento

Endereço copiável, horário atual calculado pelas regras da unidade, links para rotas, WhatsApp e telefone. Encerrar com uma chamada objetiva para agendar, sem repetir todo o conteúdo da abertura.

## 8. Mobile como projeto principal

- Projetar primeiro para 360–430 px e verificar também 320 px.
- Sem rolagem horizontal acidental em qualquer tela.
- Botões e áreas de toque de aproximadamente 44–48 px ou maiores.
- Fonte confortável; campos de formulário com pelo menos 16 px para evitar zoom indesejado no iPhone.
- Respeitar safe areas e a área ocupada pelo teclado virtual.
- Usar unidades modernas de viewport com fallback quando necessário.
- Barra inferior compacta com “Agendar” como ação principal e WhatsApp secundário.
- Não somar barra fixa, bolha de WhatsApp e botão flutuante competindo pelo mesmo espaço.
- Ocultar ou adaptar a barra inferior durante o agendamento e a digitação.
- Menu curto: Serviços, Resultados, Profissionais e Localização.
- Preservar escolhas ao voltar e comportamento previsível do botão Voltar do navegador.
- Navegação essencial independente de gestos, hover, WebGL e áudio.
- No desktop, ampliar a composição sem apenas esticar o layout do celular.

## 9. Motion design: coreografia com intenção

Crie um sistema de movimento consistente:

| Interação | Comportamento esperado | Duração inicial |
| --- | --- | --- |
| Botões e seletores | Feedback de pressão, cor e contorno | 120–200 ms |
| Menus e expansão de detalhes | Entrada suave com foco bem gerenciado | 180–280 ms |
| Troca de etapa da reserva | Transição curta, mantendo contexto | 200–320 ms |
| Entrada de bloco editorial | Deslocamento pequeno e opacidade | 350–600 ms |
| Abertura visual principal | Sequência curta sem atrasar os controles | até 900 ms |

Esses tempos são pontos de partida; valide no dispositivo. Prefira transform e opacity. Evite animar propriedades que forcem layout a cada frame. Não anime longos parágrafos letra por letra.

Use stagger discreto em poucos elementos, transição de imagem por seleção de serviço, mudança de estado de horário e confirmação com feedback visual sóbrio. Os elementos devem parecer parte de uma mesma direção de movimento.

Não sequestrar scroll, alterar sua velocidade, criar cursor obrigatório, aplicar parallax intenso no celular ou executar loops decorativos em toda a página. Hover magnético, se adotado, deve ser leve, apenas para ponteiro preciso e sem mover o alvo durante o clique.

Respeite prefers-reduced-motion. Nesse modo, remova deslocamentos extensos, autorrotação, parallax e sequências decorativas, mantendo indicação de estado. Conteúdo deve permanecer visível se a biblioteca de animação falhar.

## 10. Three.js + React Three Fiber + Drei

Crie uma única cena principal que fortaleça a identidade: por exemplo, um conjunto reduzido de pente, tesoura fechada e detalhe de máquina de corte, com materiais coerentes, luz de estúdio e acabamento caprichado. Escolha poucos objetos e refine-os; não espalhe modelos por cada seção.

Requisitos:

- Geometria reconhecível, proporções realistas e boa silhueta.
- Metal escovado ou acetinado com reflexos controlados; evitar plástico genérico e brilho estourado.
- Escala, exposição, gerenciamento de cor e sombra consistentes.
- Composição que preserve espaço para fotografia, texto e CTA.
- Movimento de câmera ou objeto discreto, sem rodar tudo continuamente.
- No desktop, pequena resposta ao ponteiro; no mobile, estado estável com interação opcional.
- Nenhum conteúdo essencial renderizado apenas dentro do canvas.
- Usar helpers de Drei somente quando necessários; remover controles de depuração da produção.

Modelos complexos devem vir de arquivos GLB/glTF otimizados, fornecidos ou com licença adequada. Se esses arquivos faltarem, crie objetos procedurais simples e bem acabados ou use um poster. Não prometa criar geometria fotorrealista complexa automaticamente apenas por instalar uma biblioteca.

Entregue poster estático correspondente à cena. Exiba-o imediatamente e troque para o canvas sem alteração de layout quando houver condições. Use fallback para WebGL indisponível, erro de asset, contexto perdido ou desempenho insuficiente.

Pause renderização fora da viewport e quando a aba estiver oculta. Use renderização sob demanda para cenas estáticas, invalidação quando necessário e limpeza de geometria, materiais, texturas e listeners no unmount.

## 11. Babylon.js em módulo separado

Implemente uma rota ou experiência isolada, por exemplo `/experiencia-3d`, aberta pelo botão “Explorar em 3D”. Use Babylon.js para uma pequena vitrine interativa de cadeira e bancada ou outro conjunto aprovado.

O objetivo é permitir rotação limitada, observar detalhes e restaurar a câmera. Não construir um jogo ou uma navegação complexa. Se o ambiente for conceitual, identificá-lo como tal; não representar uma reconstrução fiel da barbearia sem referências reais.

- Carregar o bundle e os assets somente após a abertura da experiência.
- Desmontar a cena R3F ao entrar na rota Babylon; não manter duas engines renderizando simultaneamente.
- Nunca usar Babylon dentro do Canvas do React Three Fiber como se fosse seu plugin.
- Não importar Babylon no bundle crítico da página inicial.
- Controles acessíveis: girar, aproximar dentro de limites, restaurar visão e sair.
- Oferecer alternativa em imagens estáticas com as mesmas informações.
- Preservar o rascunho de agendamento ao sair e voltar.
- Realizar dispose de cena, engine e recursos ao encerrar.

O agendamento inteiro deve funcionar sem abrir essa rota. A presença das quatro tecnologias solicitadas deve ter responsabilidades claras, sem duplicação gratuita de renderizadores.

## 12. Fotografias e imagens que serão fornecidas

Prepare a interface para receber imagens de referência e imagens finais enviadas posteriormente. Separe referência de estilo de asset autorizado para publicação. Não aplique capturas de sites de referência como imagens da barbearia.

Crie um manifesto de mídia com id, arquivo, uso, texto alternativo, proporção, ponto focal, crédito/licença e variantes. As imagens devem ser substituíveis sem editar componentes.

### Mapa inicial de imagens

| ID/arquivo sugerido | Uso | Proporção | Direção visual |
| --- | --- | --- | --- |
| hero-desktop.webp | Abertura ampla | 16:10 | Corte em execução ou retrato editorial, com área de respiro |
| hero-mobile.webp | Abertura no celular | 4:5 | Enquadramento vertical próprio, preservando rosto e mãos |
| servico-corte.webp | Serviço de corte | 4:5 | Detalhe do acabamento, cabelo e ferramenta |
| servico-barba.webp | Serviço de barba | 4:5 | Precisão no contorno, pele e textura naturais |
| servico-completo.webp | Combinação de serviços | 4:5 | Resultado final com composição limpa |
| ambiente-principal.webp | Espaço da barbearia | 3:2 | Visão real do ambiente, iluminação acolhedora |
| detalhe-bancada.webp | Transição editorial | 3:2 | Ferramentas organizadas e materiais táteis |
| profissional-01.webp | Retrato da equipe | 4:5 | Retrato real, fundo coerente e expressão natural |
| galeria-01 a 06.webp | Galeria de resultados | 4:5 | Trabalhos reais; recortes padronizados |
| fachada.webp | Localização | 3:2 | Entrada real reconhecível por quem chega |
| cena-3d-poster.webp | Fallback da cena | conforme container | Mesma composição da cena renderizada |

Dimensões de origem sugeridas: 1600–2000 px de largura para abertura desktop; 1000–1200 px para retratos e mobile. Gere derivados menores conforme a largura real de exibição. Use AVIF/WebP com fallback e srcset/sizes.

As imagens podem ter funções distintas; não repetir o mesmo retrato em várias seções. Não embutir textos e botões dentro delas. Controlar object-position para preservar rostos, mãos e ferramentas. Definir dimensões para evitar layout shift.

Fotografias de equipe, fachada e resultados devem ser reais quando apresentadas como evidência do estabelecimento. Imagens geradas podem ilustrar a direção visual, mas não devem simular fatos comerciais. Quando os assets finais faltarem, usar placeholders locais elegantes, identificados no modo demo, sem links quebrados ou dependência de imagens aleatórias remotas.

## 13. Agendamento completo

Implementar rota própria `/agendar`, acessível por link direto e por todos os CTAs. Pode aparecer como painel no desktop, mas no celular deve ter espaço suficiente e navegação clara. Não colocar o processo inteiro em um modal pequeno.

### Etapa 1 — Serviço

Mostrar nome, descrição, preço e duração. Permitir adicionais compatíveis. Se permitir vários serviços, calcular duração total e intervalos, validar profissionais habilitados e não contar um serviço duas vezes em um combo.

### Etapa 2 — Profissional

Oferecer profissionais habilitados e “Primeiro disponível”. Nesse caso, atribuir um profissional concreto de forma atômica no servidor. Não criar reserva sem responsável ou mudar a escolha silenciosamente após a confirmação.

### Etapa 3 — Data e horário

Exibir calendário compacto e horários em botões de toque. Respeitar expediente, pausas, feriados, bloqueios, duração total, preparação, antecedência mínima e horizonte máximo de reservas. Distinguir horário indisponível, carregando, selecionado e livre.

Se não houver vagas, apresentar datas seguintes ou opção de solicitar encaixe. Solicitação de encaixe não equivale a reserva confirmada. Usar disponibilidade real; não criar escassez artificial.

### Etapa 4 — Dados e revisão

Pedir nome e telefone/WhatsApp. E-mail opcional, salvo necessidade real da integração. Não obrigar criação de conta. Validar no frontend e servidor; aceitar colagem e normalizar telefone sem rejeitar formatos válidos.

Mostrar resumo com serviço, profissional, data, horário, duração, valor total, endereço e política aplicável. Separar aceite operacional de consentimento opcional para marketing, inicialmente desmarcado. Não pedir CPF, data de nascimento ou endereço residencial sem finalidade definida.

### Etapa 5 — Confirmação

Confirmar apenas após resposta persistida do servidor. Exibir código, resumo e ações para adicionar ao calendário, abrir rota, enviar mensagem ao WhatsApp, reagendar e cancelar conforme política.

Se houver aprovação manual, informar “Solicitação recebida, aguardando confirmação”. Se houver sinal obrigatório, informar “Aguardando pagamento”. Não usar “Confirmado” para estados pendentes.

### Confiabilidade obrigatória

- Revalidar disponibilidade no envio final.
- Impedir sobreposição de intervalos para o mesmo profissional no banco/transação. Uma restrição apenas por horário inicial é insuficiente para durações diferentes.
- Tratar simultaneidade: duas pessoas tentando reservar o mesmo período não podem receber duas confirmações.
- Usar idempotência para cliques repetidos e retentativas de rede.
- Definir máquina de estados e transições permitidas: solicitado, aguardando pagamento quando aplicável, confirmado, em atendimento, concluído, cancelado, não compareceu e expirado.
- Definir quais estados ocupam agenda; reservas temporárias precisam de expiração no servidor.
- Reagendamento deve reservar o novo intervalo e liberar o antigo atomicamente; falha não pode fazer o cliente perder a reserva original.
- Guardar instantes com fuso tratado corretamente e exibir o horário local da unidade.
- Não perder dados preenchidos em erro temporário.
- Ao perder conexão, informar que a reserva ainda não foi confirmada. Não fingir operação offline.
- Links de gestão devem usar tokens não previsíveis, com escopo e validade, sem expor dados pelo número de reserva público.

## 14. WhatsApp, calendário e lembretes

Criar contato geral e mensagens contextuais. Usar `wa.me` com número internacional apenas em dígitos e texto codificado adequadamente.

Exemplos:

- Geral: “Olá! Gostaria de saber mais sobre os serviços da [BARBEARIA].”
- Serviço: “Olá! Tenho interesse em [SERVIÇO].”
- Reserva persistida: “Olá! Meu agendamento é [CÓDIGO], para [DATA] às [HORA], com [PROFISSIONAL].”

Abrir WhatsApp não significa enviar uma mensagem nem confirmar uma reserva. Não registrar clique no WhatsApp como agendamento concluído.

Oferecer arquivo ICS e, quando adequado, link de calendário com datas e fuso corretos. Para lembretes automáticos, implementar adaptador de provedor, execução agendada, registro de envio, prevenção de duplicação, retentativas limitadas e preferências do cliente.

Envio automático de WhatsApp depende de integração oficial e configuração do provedor. Sem credenciais, deixar desativado e documentar a ativação. Nunca simular “mensagem enviada” ou automatizar WhatsApp Web de maneira improvisada.

## 15. Localização e informações úteis

Disponibilizar endereço em texto selecionável, botão copiar, Google Maps e Waze, horários e orientações reais de chegada. Validar coordenadas e links.

Carregar mapa interativo somente após interação ou proximidade da seção. Manter link de rota funcionando mesmo se o mapa externo falhar. Não representar uma captura qualquer como localização real.

Calcular “Aberto agora” com horário da unidade, intervalos, exceções e feriados cadastrados. Se faltar configuração, mostrar os horários disponíveis sem inventar estado.

FAQ deve explicar: como agendar, reagendar, cancelar, formas de pagamento, atrasos, encaixes e funcionamento. Publicar apenas políticas aprovadas.

## 16. Painel administrativo

Criar `/admin` com autenticação e proteção de rotas e APIs. Usuário anônimo não pode consultar agenda, dados de clientes ou arquivos privados.

Funcionalidades essenciais:

- Agenda diária e semanal, com filtros por profissional e status.
- Lista de próximos atendimentos e busca por nome/telefone.
- Criar agendamento manual usando as mesmas regras de disponibilidade.
- Reagendar, cancelar, concluir e marcar falta.
- Bloquear horários, férias, pausas e feriados.
- Gerenciar serviços, preços, duração, adicionais e profissionais habilitados.
- Editar contatos, endereço, políticas e conteúdo institucional.
- Enviar/substituir imagens, ajustar ponto focal e texto alternativo, com prévia mobile.
- Gestão de arquivos com validação de tipo/tamanho, processamento seguro e armazenamento durável.
- Relatórios básicos de reservas, cancelamentos, faltas e receita efetivamente registrada; distinguir projeção de receita recebida.
- Exportação CSV restrita a usuários autorizados.
- Registro de alterações relevantes, backups e procedimento de restauração.

Papéis mínimos: administrador, atendente e profissional. Validar permissões no servidor. Profissionais veem apenas o necessário à sua agenda. O link administrativo pode ficar discreto no rodapé, mas ocultar o link não é mecanismo de segurança.

## 17. Dados, segurança e privacidade

Modelar, conforme a solução adotada: unidades/configurações, serviços, adicionais, profissionais, habilitações, expedientes, exceções, clientes, reservas, itens de reserva, bloqueios, mídia, notificações e eventos de auditoria. Pagamentos só se o módulo estiver habilitado.

Preservar preço e duração contratados como snapshot da reserva; mudanças no catálogo não devem alterar reservas existentes silenciosamente.

Aplicar validação no servidor, autorização por operação, limitação de requisições, proteção adequada às sessões, tratamento seguro de uploads e segredos exclusivamente no ambiente servidor. APIs públicas de disponibilidade não devem revelar nomes ou contatos de clientes.

Não registrar telefone, tokens de gestão ou outros dados pessoais em URLs de analytics e logs desnecessários. Incluir aviso de privacidade compatível com o tratamento real, canal de contato e gestão dos consentimentos opcionais. Definir retenção e exclusão conforme as necessidades e regras aplicáveis, sem inventar certificação de conformidade.

Se usar links de gestão, evitar vazamento do token para rastreadores e terceiros. Autenticação administrativa deve usar solução consolidada; não criar senha padrão pública.

## 18. Recursos adicionais condicionais

Preparar extensões sem sobrecarregar o fluxo principal:

- Sinal/pagamento online: habilitar somente com provedor, política e credenciais. Confirmar pelo servidor/webhook verificado, não pelo retorno visual do navegador; tratar expiração, duplicidade, cancelamento e reembolso.
- Lista de espera: informar que não garante vaga; controlar autorização de contato e distribuição de ofertas.
- Mais de uma unidade: pedir unidade antes de consultar serviços e horários, caso existam.
- PWA: opcional após o núcleo estar estável. Cachear apenas conteúdo público apropriado; não cachear indiscriminadamente dados pessoais ou agenda administrativa. Reserva requer conexão.
- Fidelidade e pacotes: implementar somente com regras comerciais fornecidas; não inventar benefícios ou recorrência.

Não adicionar loja virtual, chatbot, reconhecimento facial, simulador de cabelo por IA ou área social apenas para aumentar a quantidade de funcionalidades.

## 19. Performance, acessibilidade e SEO

### Metas iniciais de performance

Tratar como metas a medir, não como garantias sem teste:

- LCP até 2,5 s, INP até 200 ms e CLS até 0,1, buscando o percentil 75 quando houver dados reais de uso.
- JavaScript crítico público até aproximadamente 250 KB comprimidos, excluindo chunks 3D que não devem ser pré-carregados automaticamente; revisar o orçamento se a stack justificar.
- Foto principal mobile próxima de 150–250 KB quando a qualidade permitir.
- Primeiro pacote 3D sob demanda, incluindo assets, idealmente até 2–3 MB; justificar excedentes e simplificar.
- Limitar inicialmente DPR da cena mobile a aproximadamente 1–1,5 e adaptar por desempenho medido.
- Buscar animação fluida em aparelhos intermediários; reduzir efeitos antes de comprometer resposta dos controles.

Não considerar score Lighthouse isolado uma prova de experiência real. Medir página inicial, fluxo de agendamento e rota 3D separadamente. Registrar dispositivo, rede e condições de teste.

Carregar a imagem principal com prioridade adequada; demais imagens sob demanda. Não usar lazy loading na imagem responsável pelo LCP. Reservar espaço para mídia, evitar sombras dinâmicas caras e limitar pós-processamento.

### Acessibilidade

Buscar WCAG 2.2 AA: contraste, semântica, foco visível, ordem de leitura, teclado, labels, mensagens de erro associadas, alternativas a arrastar e avisos de estado acessíveis. Cor não pode ser a única distinção entre horários.

Gerenciar foco ao abrir/fechar menus e etapas. Permitir zoom e não bloquear seleção de texto. Usar HTML real para formulários e CTAs. Desativar 3D não pode impedir o serviço.

### SEO local

Renderizar conteúdo público indexável, títulos e descrições específicos, hierarquia de headings, canonical, sitemap, robots e metadados sociais. Adicionar dados estruturados adequados para negócio local usando apenas nome, endereço, horário e avaliações verificados.

Não indexar painel administrativo, páginas privadas de gestão e dados de reservas. Manter consistência entre contatos do site e perfis reais da empresa.

### Métricas

Rastrear, sem dados pessoais nos eventos: início do agendamento, etapa alcançada, reserva confirmada pelo servidor, clique em WhatsApp e clique em rota. Não contar envio de formulário com erro como conversão. Configurar ferramentas e consentimentos conforme o uso real.

## 20. Estados que precisam estar desenhados

Implementar carregando, vazio, sucesso, erro e indisponibilidade para cada função importante. Cobrir especificamente:

- Nenhum serviço ativo ou profissional disponível.
- Agenda sem vagas no dia escolhido.
- Horário ocupado durante a confirmação.
- Falha de rede antes e depois do envio.
- Reenvio de reserva sem duplicação.
- Link de gestão inválido ou expirado.
- Cancelamento fora da política.
- Falha ao carregar foto, modelo 3D, mapa ou provedor externo.
- Sessão administrativa expirada.
- Dispositivo sem WebGL e preferência por movimento reduzido.

Mensagens devem explicar o problema e oferecer um próximo passo. Nada de botão sem ação, toast de sucesso falso ou spinner infinito.

## 21. Validação e critérios de aceitação

Testar o que sustenta o funcionamento real. Não considerar a tarefa concluída apenas porque a página inicial está bonita.

1. Visualizar em 320, 360, 390, 430, 768, 1024 e 1440 px sem cortes ou sobreposições.
2. Verificar Safari no iPhone e Chrome no Android quando houver acesso; distinguir teste real de emulação.
3. Fazer reserva do começo ao fim, inclusive por CTA de serviço e de profissional.
4. Confirmar duração combinada, intervalos, feriados e bloqueios.
5. Simular concorrência de duas reservas sobrepostas: apenas uma pode ocupar o período.
6. Repetir envio com a mesma chave idempotente sem criar duplicata.
7. Reagendar e cancelar; testar falha de reagendamento preservando a reserva original.
8. Conferir preço, profissional, data e horário em resumo, banco, calendário e mensagem.
9. Validar acesso administrativo, permissões e isolamento dos dados privados.
10. Testar teclado, foco, zoom, mensagens de erro e movimento reduzido.
11. Medir carregamento com rede e CPU limitadas, testando o fallback 3D.
12. Verificar que Babylon não entra no carregamento inicial nem permanece ativo junto com a cena R3F.
13. Conferir imagens, recortes, links, endereço e WhatsApp.
14. Rodar typecheck, build e testes pertinentes; relatar o que não puder executar.

Use testes unitários para regras de horários/duração, integração para persistência/autorização/concorrência e testes de fluxo para reserva/reagendamento/cancelamento. Faça revisão visual por screenshots quando o ambiente permitir.

## 22. Entregáveis

Entregue:

- Projeto completo e organizado, com site público, reserva, painel e backend.
- Configuração de banco, migrações e dados de demonstração separados da produção.
- Arquivo de exemplo das variáveis de ambiente sem segredos.
- README com execução local, build, implantação e configuração das integrações.
- DESIGN_SYSTEM.md com cores, tipografia, espaçamento, componentes e motion.
- MEDIA_GUIDE.md com mapa dos espaços, proporções, pontos focais e instruções para substituir imagens.
- COMPONENT_SOURCES.md com referências efetivamente utilizadas, licenças e adaptações.
- Documentação das regras de agendamento e estados da reserva.
- Relatório breve de testes realizados, resultados e limitações.
- Lista precisa do que depende de credenciais, fotos, dados comerciais ou decisão do proprietário.

Se o ambiente não permitir banco, backend ou envio de mensagens, entregue a implementação possível e descreva claramente a limitação. Uma demonstração local não deve ser apresentada como agenda operacional.

## 23. Ordem de implementação

1. Inspecionar contexto e Skills disponíveis; definir arquitetura e conceito.
2. Criar tokens visuais, manifesto de mídia e modelos de dados.
3. Construir a página inicial mobile com fotos e fallback estático.
4. Implementar disponibilidade, persistência e fluxo de agendamento.
5. Criar gestão administrativa e regras de acesso.
6. Integrar WhatsApp, localização, calendário e notificações configuradas.
7. Aplicar motion e cena Three.js/R3F/Drei com carregamento progressivo.
8. Implementar o módulo Babylon isolado e sob demanda.
9. Adaptar desktop, revisar acessibilidade e otimizar assets.
10. Testar, corrigir e entregar com documentação e pendências verificáveis.

Prossiga até concluir o escopo executável. Se surgir bloqueio externo, continue o restante e registre exatamente o necessário para destravar. Não trocar um agendamento persistente por um simples botão de WhatsApp sem comunicar a limitação.

## 24. Referências técnicas para consultar durante a execução

- Componentes e referências: https://21st.dev/
- Catálogo: https://21st.dev/community/components
- Three.js: https://threejs.org/
- React Three Fiber: https://r3f.docs.pmnd.rs/
- Drei: https://drei.docs.pmnd.rs/
- Babylon.js: https://doc.babylonjs.com/
- Motion for React: https://motion.dev/docs/react

O endereço de uma biblioteca mencionada em uma conversa anterior não foi identificado. Use os links acima, sem presumir que algum deles seja aquele link específico.

## Comando final de execução

Implemente este briefing por completo. Comece apresentando uma síntese objetiva da direção visual, stack e fluxo mobile e avance diretamente para o código. Crie uma experiência autoral de barbearia, com fotografias bem posicionadas, motion coordenado, 3D relevante e um agendamento confiável. Preserve acesso rápido a serviços, horários, WhatsApp e localização. Faça escolhas de implementação justificadas, teste os fluxos essenciais e entregue uma aplicação utilizável, deixando explícito qualquer requisito externo ainda não configurado.
