# PROMPT MESTRE — Site de Barbearia Premium (Mobile-First, 3D e Motion Design)

> Cole este documento inteiro como instrução inicial do Claude Code. Ele está dividido em seções numeradas. Execute na ordem, e só avance para a próxima fase quando os critérios de aceite da fase atual estiverem cumpridos.

---

## 0. PAPEL E OBJETIVO

Você é um time sênior composto por: Diretor de Arte, Motion Designer, Engenheiro Front-end/Creative Developer (WebGL) e Especialista em UX Mobile.

**Objetivo:** construir o site de uma barbearia que pareça uma experiência de marca de luxo, não um template. O site precisa:

1. Ser **deslumbrante**: motion design cinematográfico e elementos 3D reais.
2. Ser **funcional antes de bonito**: o visitante deve conseguir agendar, chamar no WhatsApp ou traçar a rota em no máximo 2 toques.
3. Ser **mobile-first**: mais de 80% dos acessos virão de celular, em 4G, em aparelhos de gama média.
4. Ser **original**: proibido o layout genérico de barbearia (veja a seção 3).

**Idioma do site:** Português (Brasil). **Código, variáveis e commits:** inglês.

---

## 1. FERRAMENTAS, SKILLS E ORDEM DE USO

Use obrigatoriamente, nesta ordem.

### 1.1 Skills (invocar via ferramenta Skill antes de escrever código)
- `artifact-design` e `anthropic-skills:web-artifacts-builder`: fundamentos de design e estrutura do site.
- `design:design-system`: tokens, componentes e documentação do design system.
- `design:accessibility-review`: auditoria WCAG 2.1 AA ao final de cada fase.
- `design:ux-copy`: textos de botões, erros, estados vazios e confirmações.
- `design:design-critique`: critique o resultado antes de entregar cada fase.
- `marketing:seo-audit`: SEO técnico e local.
- `engineering:testing-strategy` e `engineering:deploy-checklist`: testes e publicação.
- `remotion:remotion-best-practices` **apenas se** houver vídeo promocional (opcional, fase 9).

### 1.2 21st.dev (MCP `mcp__21stdev__*`)
Carregue as ferramentas com ToolSearch e use:
- `search` / `get_inspiration`: buscar componentes e referências de UI (botões, cards, carrosséis, menus, seções de depoimentos, formulários, stepper de agendamento).
- `get_component`: trazer o código e **adaptá-lo** ao design system. Nunca colar sem adaptar tokens, cores e movimento.
- `search_logo`: ícones de redes e meios de pagamento.
- `record_inspiration_feedback`: registrar o que foi aproveitado.
- **Biblioteca de referência do dono do projeto:** https://naocodei.com/free-code/ (elementos e códigos gratuitos para sites). Acesse a página, catalogue em `/docs/references.md` os elementos aproveitáveis (nome, tecnologia, onde usar no site) e adapte-os ao design system. Trate-a como fonte primária de elementos, junto com o 21st.dev. Se a página estiver inacessível no ambiente, avise o dono e peça que ele cole o código ou prints dos elementos desejados.

### 1.3 Stack técnica

| Camada | Escolha |
|---|---|
| Framework | **Vite + React 18 + TypeScript** (ou Next.js 14 App Router, se SSR/SEO for prioridade; decida e justifique) |
| Estilo | **Tailwind CSS** + CSS variables para tokens |
| 3D principal | **Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)** |
| 3D complementar | **Babylon.js** (`@babylonjs/core`, `@babylonjs/loaders`), carregado com `import()` dinâmico, **somente** no visualizador de produto/ferramenta (seção 5.4) |
| Pós-processamento | `@react-three/postprocessing` (Bloom leve, Vignette; desligado em dispositivos fracos) |
| Animação UI | **GSAP + ScrollTrigger** e **Framer Motion** (não use as duas para a mesma coisa) |
| Scroll suave | **Lenis** (desativar em `prefers-reduced-motion`) |
| Estado | **Zustand** |
| Formulários | **React Hook Form + Zod** |
| Datas | **date-fns** (locale `pt-BR`) |
| Backend de agendamento | **Supabase** (Postgres + Edge Functions + RLS) |
| Mapa | Google Maps embed leve **ou** MapLibre, carregado sob demanda |
| Hospedagem | Cloudflare Pages ou Vercel |
| PWA | `vite-plugin-pwa` (instalável, offline do básico) |

> **Regra de convivência R3F + Babylon:** nunca renderizar os dois na mesma tela ao mesmo tempo. Apenas **um contexto WebGL ativo** por vez em mobile. O Babylon só monta ao abrir o modal do visualizador de produto e **destrói o engine** ao fechar (`engine.dispose()`).

---

## 2. DIREÇÃO DE ARTE (DEFINA ANTES DE CODAR)

Entregue primeiro um **mini brandbook** em `/docs/brandbook.md` com:

- **Conceito criativo:** escolha UM e mantenha: *"Atelier noturno"* (luz âmbar, sombras profundas, metal escovado) **ou** *"Oficina cinematográfica"* (neon sutil, fumaça, couro). Justifique.
- **Paleta** (tokens CSS): fundo quase preto (`--ink`), um acento quente (âmbar/cobre/latão), um neutro quente claro, um tom de apoio. Verificar contraste AA.
- **Tipografia:** uma fonte *display* de caráter (serifada de alto contraste ou condensada grotesca) + uma fonte de texto legível. Máx. 2 famílias. `font-display: swap`, subset latino.
- **Linguagem de movimento:** curvas de easing nomeadas (`--ease-out-expo`, `--ease-in-out-quart`), durações padrão (120/240/480/800 ms), regras de stagger.
- **Textura e luz:** grão de filme sutil, gradientes de luz, bordas finas, sombras longas. Sem sombras genéricas de Material.
- **Iconografia:** traço fino e consistente, desenhado sob medida, sem pacote genérico.
- **Imagens:** tratamento único (duotone/grain/contraste) para que as fotos do cliente fiquem coesas. Veja a seção 7.

---

## 3. ANTI-GENÉRICO: O QUE É PROIBIDO

- ❌ Hero com foto de fundo + título centralizado + botão "Agende agora" + overlay escuro.
- ❌ Seções empilhadas iguais (ícone + título + 3 colunas) estilo template.
- ❌ Poste de barbeiro listrado como único elemento "temático" clichê, a não ser que seja reinterpretado em 3D com intenção.
- ❌ Carrossel de depoimentos padrão com setinhas.
- ❌ Grid de preços em tabela simples.
- ❌ Animações de fade-up idênticas em todos os blocos.
- ❌ Fontes e cores default (Inter + azul/preto sem personalidade).
- ❌ Parallax decorativo que atrapalha a leitura.

**✅ Em vez disso:**
- Narrativa de **rolagem como jornada** (um "dia na barbearia": chegada, cadeira, lâmina, acabamento, resultado).
- Navegação e transições de página com **continuidade espacial** (elementos que se transformam entre telas).
- Cada seção com **layout e coreografia próprios**, mas regidos pelo mesmo sistema.
- Interações táteis: *magnetic buttons*, cursor customizado (desktop), arraste com inércia, *haptics* (`navigator.vibrate`) em confirmações no mobile.

---

## 4. ARQUITETURA DE INFORMAÇÃO E MAPA DO SITE

Site de página principal com rolagem narrativa, mais rotas funcionais:

```
/                    Experiência principal (narrativa)
/agendar             Fluxo de agendamento (stepper em tela cheia)
/servicos            Catálogo completo (opcional, deep-link)
/equipe/:slug        Perfil do barbeiro (opcional)
/galeria             Galeria completa
/contato             Contato, mapa, horários
/meu-agendamento     Consultar/cancelar/remarcar (via código ou link mágico)
/politicas           Privacidade, termos, cancelamento
/admin               Painel (fase 8, protegido)
```

### 4.1 Seções da página principal (ordem narrativa)

1. **Abertura (Hero 3D)**: cena 3D imersiva, nome da marca, promessa em uma linha e 2 CTAs: *Agendar* e *WhatsApp*.
2. **Manifesto**: texto grande revelado por palavra/linha conforme a rolagem, com elemento 3D reagindo.
3. **Serviços**: apresentados como "estações" interativas, não como tabela. Cada serviço mostra nome, duração, preço e botão *Agendar este serviço* (pré-seleciona no fluxo).
4. **O ritual** (processo): sequência rolável (*scroll-pinned*) com o passo a passo do atendimento, com objeto 3D que se transforma a cada etapa.
5. **Equipe**: cards dos barbeiros com foto, especialidade, nota, próximos horários livres e botão *Agendar com [nome]*.
6. **Antes e depois / Galeria**: slider de comparação arrastável + galeria em grade assimétrica com lightbox gestual.
7. **Planos e combos / Clube de assinatura** (se aplicável): cards com destaque.
8. **Produtos** (opcional): vitrine com **visualizador 3D (Babylon.js)** de pomada, navalha, etc.
9. **Prova social**: avaliações reais (nota, texto, foto), integração com Google Reviews se possível; faixa contínua em *marquee* controlável.
10. **Localização e horários**: mapa, status "Aberto agora / Fecha às 20h", botão *Como chegar*.
11. **FAQ**: acordeão acessível.
12. **CTA final + Rodapé**: agendar, WhatsApp, redes sociais, endereço, CNPJ, links legais.

### 4.2 Elementos globais persistentes (mobile)

- **Barra de ação fixa inferior** (thumb zone), sempre visível: `[Agendar]` `[WhatsApp]` `[Ligar]` `[Rota]`. Esconde ao rolar para baixo rápido, volta ao rolar para cima. Respeita `env(safe-area-inset-bottom)`.
- **Menu** em tela cheia, animado, com links grandes e atalhos de contato.
- **Indicador de progresso** de rolagem discreto.
- **Banner de cookies/LGPD** mínimo e elegante.

---

## 5. ELEMENTOS 3D (ESPECIFICAÇÃO)

### 5.1 Hero: cena R3F
- Objeto central em 3D (escolha uma direção e execute com qualidade): **navalha antiga**, **tesoura**, **cadeira de barbeiro** ou **poste reinterpretado**. Modelo `.glb` otimizado (≤ 1.5 MB, Draco/Meshopt, texturas KTX2/WebP) ou geometria procedural.
- Materiais PBR realistas: metal escovado, couro, vidro; `MeshTransmissionMaterial` e `Environment` (preset *warehouse* ou HDRI próprio de baixa resolução) do Drei.
- Iluminação cinematográfica: luz de recorte âmbar, luz de preenchimento fria, sombras suaves de contato (`ContactShadows`).
- **Reatividade:** no desktop segue o mouse; no mobile reage ao **giroscópio** (`DeviceOrientation`, com pedido de permissão no iOS) e ao toque/arraste. Sempre com *fallback* por rolagem.
- Partículas sutis (pelos/cabelo estilizados, poeira de luz) com `Instances`/`Points`, baixa contagem.
- **Transição:** ao rolar, o objeto se desloca/rotaciona/escala conforme `ScrollControls` do Drei ou GSAP ScrollTrigger sincronizado, saindo do hero e guiando o olhar para a seção seguinte.

### 5.2 "O ritual": objeto que se transforma
Um objeto 3D fixo (*pinned*) que muda de pose, material ou forma em cada etapa do atendimento (ex.: toalha quente → espuma → lâmina → loção). Progresso ligado à rolagem (0 a 1).

### 5.3 Microelementos 3D em UI
- Selo/medalha 3D girando no CTA do clube.
- Cards da equipe com leve inclinação 3D (*tilt*) por toque/giroscópio (pode ser CSS 3D para poupar GPU).
- Ícones de serviço em 3D leve ou *pseudo-3D* com sombras.

### 5.4 Visualizador de produto (Babylon.js)
- Modal em tela cheia, carregado sob demanda (`import()`), com `ArcRotateCamera`, controle por toque (girar, pinça para zoom), iluminação por IBL, `GlowLayer` sutil.
- Botões: *Girar automaticamente*, *Ver detalhes*, *Pedir no WhatsApp*.
- Ao fechar: liberar todos os recursos (`scene.dispose()`, `engine.dispose()`).

### 5.5 Regras de performance 3D (obrigatórias)
- **Detecção de capacidade:** `detect-gpu` (ou heurística: `deviceMemory`, `hardwareConcurrency`, `devicePixelRatio`). Três perfis: **alto / médio / baixo**.
  - Alto: pós-processamento, DPR até 2, sombras.
  - Médio: sem pós-processamento, DPR 1.5, menos partículas.
  - Baixo ou `prefers-reduced-motion` ou *Save-Data*: **poster estático** (imagem/vídeo curto em loop) no lugar do canvas.
- `<Canvas dpr={[1, 1.5]} frameloop="demand">` quando a cena não está animando; `frameloop="always"` só quando visível (`IntersectionObserver`).
- Pausar render quando a aba está oculta ou o canvas está fora da viewport.
- *Lazy load* do 3D: o HTML/CSS do hero aparece imediatamente (LCP com poster) e o 3D entra depois, com *crossfade*.
- Orçamento: **JS inicial ≤ 180 KB gz**, 3D em *chunk* separado, **modelos ≤ 1.5 MB cada**, **total de 3D ≤ 4 MB**.
- Meta: **60 fps em gama média**, nunca abaixo de 30 fps; **LCP ≤ 2.5 s em 4G**, **CLS < 0.1**, **INP < 200 ms**.
- Ter *fallback* de erro: se WebGL falhar, mostrar versão estática sem quebrar a página (`ErrorBoundary`).

---

## 6. FUNCIONALIDADES (TODAS OBRIGATÓRIAS)

### 6.1 Agendamento online (núcleo do sistema)

**Fluxo em stepper de tela cheia, pensado para o polegar:**

1. **Serviço(s):** seleção múltipla com duração e preço somados. Chips de combos.
2. **Profissional:** escolher barbeiro específico ou *"Sem preferência"* (atribuição automática ao primeiro disponível).
3. **Data:** faixa horizontal de dias (próximos 30), dias sem vaga desabilitados, feriados e folgas respeitados.
4. **Horário:** grade de horários livres calculados pela duração total; mostrar "últimas vagas" quando restar pouco.
5. **Dados:** nome, WhatsApp (máscara BR + validação), e-mail (opcional), observações. **Sem exigir cadastro/senha.**
6. **Revisão e confirmação:** resumo com total, política de cancelamento, aceite LGPD.
7. **Sucesso:** animação de confirmação, código do agendamento, botões *Adicionar ao calendário* (arquivo `.ics` + links Google/Apple), *Compartilhar*, *Enviar confirmação por WhatsApp*, *Como chegar*.

**Regras de negócio:**
- Cálculo de disponibilidade por profissional: jornada, intervalos/almoço, folgas, bloqueios, duração dos serviços, *buffer* entre atendimentos, antecedência mínima e máxima.
- **Controle de concorrência:** reserva atômica no banco (constraint de exclusão/transação) para impedir dois clientes no mesmo horário; *hold* temporário de 5 min ao entrar na etapa de confirmação.
- Cancelar/remarcar até X horas antes (configurável) via código + telefone ou **link mágico**.
- Lembrete automático (WhatsApp/e-mail) 24 h e 2 h antes (Edge Function + agendador).
- Lista de espera: se não houver horário, permitir entrar na fila e ser avisado.
- Anti-spam: honeypot + rate limit + Cloudflare Turnstile (invisível).
- Persistir rascunho do fluxo (`sessionStorage`) para o usuário não perder o progresso.
- Fuso horário fixo `America/Sao_Paulo`; armazenar em UTC.

**Banco (Supabase), tabelas mínimas:** `services`, `professionals`, `professional_services`, `working_hours`, `time_off`, `appointments`, `appointment_services`, `customers`, `waitlist`, `reviews`, `settings`. **RLS ativado em todas**; o público só chama funções RPC/Edge Functions específicas, nunca acesso direto às tabelas.

### 6.2 Integração com WhatsApp
- Botão fixo global (`https://wa.me/55DDDNUMERO?text=...`) com **mensagem pré-preenchida contextual**:
  - Geral: "Olá! Vim pelo site e gostaria de informações."
  - Em serviço: "Olá! Quero agendar *[serviço]*."
  - Em barbeiro: "Olá! Quero agendar com *[nome]*."
  - Pós-agendamento: resumo com serviço, data, hora e código.
- Detectar mobile (abre o app) e desktop (WhatsApp Web).
- Número e mensagens configuráveis em um único arquivo (`/src/config/site.ts`).
- Evento de analytics em cada clique.

### 6.3 Localização e contato
- Cartão de endereço com: mapa interativo, botão **Como chegar** (links profundos para Google Maps, Waze e Apple Maps com detecção de plataforma), **Copiar endereço**, estacionamento/ponto de referência.
- **Status em tempo real:** "Aberto agora · fecha às 20:00" / "Fechado · abre amanhã às 09:00", calculado no fuso correto, com feriados.
- Quadro de horários por dia da semana (hoje destacado).
- Botões diretos: **Ligar** (`tel:`), **E-mail** (`mailto:`), **Instagram**, **TikTok**, **Google Maps (avaliar)**.
- Formulário de contato curto (nome, WhatsApp, mensagem) com validação, estados de envio e resposta clara.

### 6.4 Outras funções necessárias
- **Catálogo de serviços e preços** editável (fonte única de dados).
- **Combos e clube de assinatura**, com CTA para contratar via WhatsApp/checkout.
- **Cupons e promoções** (campo opcional na revisão).
- **Pagamento** (opcional, fase futura): Pix com QR Code e/ou sinal via Mercado Pago/Stripe para reduzir faltas. Deixar a arquitetura pronta, desativada por *feature flag*.
- **Avaliações:** exibir e permitir enviar após o atendimento (link único por agendamento).
- **Galeria e antes/depois** com carregamento progressivo.
- **Painel administrativo** (`/admin`, login com Supabase Auth): agenda do dia/semana, bloquear horários, cadastrar serviços/barbeiros/preços, ver clientes, marcar *compareceu/faltou*, exportar CSV. Mobile-first também.
- **Notificações:** e-mail transacional (Resend) e WhatsApp (link ou API oficial, se contratada).
- **Compartilhamento:** botão de compartilhar (Web Share API) com *fallback* de copiar link.
- **PWA:** instalável, ícones, tela inicial, cache dos assets e página offline com atalho de WhatsApp e telefone.
- **Multi-idioma** (opcional): estrutura i18n pronta com pt-BR como padrão.
- **LGPD:** política de privacidade, consentimento de cookies, direito de exclusão de dados do cliente.

---

## 7. IMAGENS E ESPAÇOS PARA ASSETS

O dono do projeto vai criar imagens de referência (IA/foto). Estruture o projeto para **encaixá-las sem refatorar**:

- Pasta `/public/assets/` com subpastas e **nomes de arquivo padronizados**:
  ```
  /hero/        hero-poster.webp, hero-poster-mobile.webp
  /services/    service-<slug>.webp
  /team/        barber-<slug>.webp
  /gallery/     gallery-01.webp … gallery-24.webp
  /before-after/ ba-01-before.webp, ba-01-after.webp
  /products/    product-<slug>.webp
  /og/          og-image.jpg (1200×630)
  /3d/          *.glb, *.ktx2, env.hdr
  ```
- **Componente `<SmartImage>`:** `srcset`/`sizes`, AVIF/WebP, `loading="lazy"` (exceto LCP com `fetchpriority="high"`), *blur-up* (LQIP/BlurHash), proporção reservada (sem CLS), `alt` obrigatório.
- **Placeholders elegantes** enquanto o cliente não enviar as imagens: blocos com gradiente + grão + legenda do tamanho recomendado (ex.: "Foto do barbeiro · 800×1000").
- **Arquivo `ASSETS.md`** listando cada espaço de imagem: caminho, dimensão recomendada, proporção, peso máximo, orientação e instrução de enquadramento, para o dono gerar as imagens certas.
- Tratamento visual unificado por CSS (`mix-blend`, duotone, grão) para coesão entre imagens de fontes diferentes.
- Gerar versões automáticas (script `sharp`) em 480/768/1200/1920 px.

---

## 8. MOTION DESIGN (COREOGRAFIA)

- **Sistema:** definir presets reutilizáveis (`revealLines`, `revealMask`, `parallaxSoft`, `magnetic`, `stagger`) em um único módulo.
- **Texto:** *split* por linha/palavra com máscara (clip), nunca por letra em parágrafos longos (legibilidade).
- **Scroll:** ScrollTrigger com `scrub` suave; seções *pinned* limitadas (máx. 3) para não cansar no mobile.
- **Transições de rota:** *shared element transitions* (Framer Motion `layoutId` / View Transitions API com *fallback*).
- **Microinterações:** estados de *hover/press/focus* em todo elemento interativo; *press* com escala 0.97 e retorno elástico; *ripple* de luz âmbar.
- **Loading inicial:** animação de abertura curta (≤ 1.8 s) que **não bloqueia** o conteúdo; pulável.
- **Feedback de agendamento:** transições entre passos com direção (avançar/voltar), barra de progresso animada, confirmação com partículas discretas e *haptic*.
- **Acessibilidade de movimento:** respeitar `prefers-reduced-motion` (trocar por fades curtos e sem parallax/3D contínuo). Oferecer um botão "Reduzir animações".
- Tudo animado apenas com `transform` e `opacity`; sem animar `top/left/width/height`.

---

## 9. MOBILE-FIRST (REGRAS INEGOCIÁVEIS)

- Projetar a 360–430 px primeiro; depois 768, 1024, 1440.
- **Alvos de toque ≥ 48×48 px**, espaçamento ≥ 8 px entre alvos.
- Ações principais na **zona do polegar** (inferior da tela).
- Usar `100dvh` (não `100vh`), `env(safe-area-inset-*)`, `touch-action` correto, `overscroll-behavior`, sem *scroll jacking* agressivo.
- Teclado: `inputmode="tel"` e `autocomplete` adequados (`name`, `tel`, `email`), `enterkeyhint`; o campo ativo nunca fica atrás do teclado.
- Gestos: *swipe* no lightbox e entre passos do agendamento; sempre com botão equivalente.
- Peso: imagens responsivas, fontes subsetadas, `preconnect` somente do necessário.
- Testar em: iPhone SE/13/15 (Safari), Pixel e Galaxy de gama média (Chrome), modo paisagem, 3G/4G lento (throttling), modo escuro do sistema.
- Sem *hover-only*: tudo que aparece no hover deve ter equivalente no toque.

---

## 10. QUALIDADE, ACESSIBILIDADE, SEO E ANALYTICS

**Acessibilidade (WCAG 2.1 AA):** HTML semântico, `skip link`, foco visível, navegação completa por teclado, `aria-live` nas confirmações e erros, contraste ≥ 4.5:1, `alt` descritivo, canvas 3D com `aria-hidden` e descrição textual equivalente, formulários com `label` e mensagens de erro associadas.

**SEO técnico e local:**
- `title`/`meta description` únicos, Open Graph/Twitter Cards, `sitemap.xml`, `robots.txt`, canonical.
- **JSON-LD `HairSalon`/`BarberShop`** (`LocalBusiness`) com endereço, geo, horários, telefone, faixa de preço, redes, avaliações.
- Conteúdo com palavras-chave locais naturais ("barbearia em [bairro/cidade]").
- Pré-renderização/SSR das seções críticas para indexação.
- Vincular ao Google Meu Negócio.

**Analytics (com consentimento):** Plausible/GA4 + eventos: `cta_agendar_click`, `whatsapp_click`, `call_click`, `route_click`, `booking_step_view`, `booking_complete`, `booking_abandon`, `product_3d_open`. Funil de conversão visível.

**Testes:**
- Unitários (Vitest) para cálculo de disponibilidade e regras de conflito.
- E2E (Playwright, viewports mobile) do fluxo completo de agendamento, cancelamento e WhatsApp.
- Lighthouse mobile: **Performance ≥ 90, Acessibilidade ≥ 95, SEO ≥ 95, Best Practices ≥ 95**.
- Teste de carga básico das funções de reserva (concorrência).

**Segurança:** RLS, validação com Zod no cliente **e** no servidor, rate limit, sanitização, headers (CSP, HSTS), segredos apenas em variáveis de ambiente, nenhuma chave de serviço no front-end.

---

## 11. ESTRUTURA DO PROJETO

```
barber-site/
├─ public/assets/…            (seção 7)
├─ src/
│  ├─ app/ (rotas)
│  ├─ components/
│  │  ├─ ui/                  (botões, inputs, chips, sheet, toast)
│  │  ├─ motion/              (presets, Reveal, Magnetic, SplitText)
│  │  ├─ three/               (Scene, Hero3D, Ritual3D, Loader3D, quality.ts)
│  │  ├─ babylon/             (ProductViewer.tsx, lazy)
│  │  ├─ booking/             (Stepper, ServiceStep, ProStep, DateStep, TimeStep, DataStep, Review, Success)
│  │  ├─ sections/            (Hero, Manifesto, Services, Ritual, Team, Gallery, Reviews, Location, FAQ, Footer)
│  │  └─ layout/              (ActionBar, Menu, Header)
│  ├─ config/site.ts          (nome, telefone, WhatsApp, endereço, horários, redes)
│  ├─ lib/                    (availability.ts, whatsapp.ts, maps.ts, ics.ts, analytics.ts)
│  ├─ store/                  (booking, ui, quality)
│  ├─ styles/tokens.css
│  └─ hooks/                  (useReducedMotion, useDeviceQuality, useOpenNow)
├─ supabase/ (migrations, functions, seed)
├─ docs/ (brandbook.md, ARCHITECTURE.md, ASSETS.md)
└─ tests/ (unit, e2e)
```

---

## 12. FASES DE ENTREGA (COM CRITÉRIOS DE ACEITE)

| Fase | Entrega | Critério de aceite |
|---|---|---|
| **1. Descoberta e arte** | brandbook, tokens, wireframes mobile, mapa de motion | Aprovado pelo dono antes de codar |
| **2. Fundação** | projeto, tokens, componentes base, `site.ts`, ActionBar, menu | Lighthouse ≥ 90 em página vazia; layout responsivo |
| **3. Hero 3D + qualidade** | cena R3F, perfis de qualidade, poster fallback | 60 fps gama média; fallback funcionando |
| **4. Seções narrativas** | todas as seções 4.1 com motion | Sem layout genérico; `reduced-motion` OK |
| **5. Agendamento** | fluxo completo + Supabase + conflitos | E2E verde; sem dupla reserva em teste de concorrência |
| **6. WhatsApp, mapa e contato** | seção 6.2 e 6.3 completas | Links testados em iOS e Android |
| **7. Babylon.js produto + extras** | visualizador, galeria, avaliações, PWA | Engine destruído ao fechar; sem vazamento de memória |
| **8. Admin** | agenda, bloqueios, cadastros | Fluxo real de um dia de operação |
| **9. Polimento** | SEO, acessibilidade, analytics, vídeo opcional | Metas de Lighthouse e Core Web Vitals atingidas |
| **10. Deploy** | CI/CD, domínio, monitoramento, checklist | `engineering:deploy-checklist` completo |

**A cada fase:** (1) rodar `design:design-critique` e `design:accessibility-review`; (2) testar em viewport mobile real via Playwright; (3) commitar com mensagem clara; (4) resumir o que foi feito, o que falta e riscos.

---

## 13. REGRAS DE TRABALHO

1. **Pergunte** só o que for indispensável e que não tenha padrão razoável: nome da marca, cidade/endereço, telefone/WhatsApp, horários, lista de serviços e preços, equipe. Enquanto não houver, use dados fictícios claramente marcados em `site.ts` (`// TODO: substituir`).
2. **Não invente** avaliações, selos, prêmios ou números de clientes reais; use placeholders sinalizados.
3. Prefira **simplicidade que funciona**: o 3D deve servir à marca e à conversão, nunca atrapalhar o agendamento.
4. **Funcionalidade acima de efeito:** se um efeito prejudica desempenho, acessibilidade ou clareza, simplifique-o.
5. Entregue sempre **código que roda** (`npm run dev`, `npm run build`, `npm run test` passando).
6. Documente decisões em `docs/ARCHITECTURE.md` e mantenha `ASSETS.md` atualizado.
7. Ao terminar cada fase, mostre capturas de tela mobile (Playwright) como evidência.

---

## 14. CHECKLIST FINAL DE ACEITE

- [ ] Agendar do início ao fim em ≤ 60 s no celular, sem cadastro.
- [ ] Nenhum horário pode ser reservado duas vezes.
- [ ] WhatsApp abre com mensagem contextual correta (iOS, Android, desktop).
- [ ] Botões Ligar, Rota (Maps/Waze) e Copiar endereço funcionam.
- [ ] Status "Aberto agora" correto, inclusive feriados.
- [ ] 3D roda a 60 fps em gama média; fallback estático em aparelhos fracos.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Todas as imagens com espaço pronto, `alt` e tamanhos responsivos.
- [ ] Lighthouse mobile ≥ 90/95/95/95; LCP ≤ 2.5 s; CLS < 0.1.
- [ ] WCAG 2.1 AA verificado.
- [ ] SEO local, JSON-LD e Open Graph presentes.
- [ ] PWA instalável.
- [ ] Painel admin funcional e protegido.
- [ ] LGPD: política, consentimento, exclusão de dados.
- [ ] Testes unitários e E2E passando; CI verde; deploy publicado.

---

### PRIMEIRA AÇÃO AO RECEBER ESTE PROMPT
1. Invoque as skills da seção 1.1 e carregue as ferramentas do 21st.dev.
2. Acesse a biblioteca de referência (https://naocodei.com/free-code/), gere `/docs/references.md` e peça os dados indispensáveis (seção 13.1).
3. Entregue a **Fase 1** (brandbook + wireframes mobile + mapa de motion) e aguarde aprovação antes de codar.
