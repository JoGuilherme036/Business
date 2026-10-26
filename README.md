# Business Barbearia — site premium com agendamento e catálogo de produtos

Site mobile-first da **Business Barbearia** (Teresina/PI), no tema **preto e branco** (seções pretas intercaladas com brancas), com a tipografia expandida do letreiro: introdução com o vídeo da máquina que se desmonta e forma o logotipo, quadro a quadro conforme a rolagem, agenda ao vivo, serviços com comanda, **catálogo de produtos com sacola e reserva pelo WhatsApp**, agendamento completo, painel da barbearia e planos do clube.

> ⚠️ **Dados a confirmar.** Endereço, horários e Instagram vêm do perfil oficial da barbearia. WhatsApp/telefone, e-mail, bairro, coordenadas, preços, equipe, planos e a lista de produtos são **de demonstração** e estão marcados com `DEMO` em `src/config/`.
>
> A agenda roda na **Cloudflare** (Worker + D1 + Durable Object de tempo real). Em `npm run dev` e na prévia estática, o site usa um modo demonstração que salva só no navegador.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm test           # testes unitários (disponibilidade, horários, adaptador de reservas)
```

## O que tem no site

| Área | Onde | Destaques |
|---|---|---|
| Introdução com vídeo | `src/components/sections/Intro.tsx` + `background/ScrollFilm.tsx` | A animação toca só aqui, fixa na tela enquanto se rola: título legível, duas legendas, marcador de capítulos, "Pular introdução" e atalho "Próximo horário livre". 72 quadros WebP (2 MB no celular) desenhados num canvas; só os quadros perto da posição atual ficam abertos na memória e dois vizinhos se misturam para o movimento ficar contínuo. Funciona no iPhone e nos navegadores do Instagram/WhatsApp, onde vídeo não carrega sem toque |
| Agenda ao vivo | `src/components/sections/LiveBoard.tsx` | Próximos horários livres do serviço escolhido; um toque abre o agendamento já na etapa de dados |
| Serviços + comanda | `src/components/sections/Services.tsx`, `Comanda.tsx` | Toque em + para somar serviços numa comanda (tempo e total na hora); "Escolher horário" leva tudo para o agendamento. A barra inferior mostra quantos itens há na comanda |
| Catálogo de produtos | `src/pages/Products.tsx`, `src/shop/`, `src/config/products.ts` | Página `/produtos` com filtro por categoria, busca, ordenação, detalhe do produto (link compartilhável `?produto=id`), kits e **sacola** salva no aparelho. O pedido é enviado por WhatsApp para retirada na barbearia (sem pagamento online). Na home, a seção "A linha Business" destaca os principais |
| Página inicial | `src/pages/Home.tsx` + `src/components/sections/` | Manifesto, experiência (fixada no desktop), produtos, barbeiros, espaço, clube, localização, dúvidas, epílogo com o último quadro da introdução |
| Agendamento | `src/pages/Booking.tsx` + `src/components/booking/` | Serviço → barbeiro (ou primeiro disponível) → dia/horário → dados → revisão → confirmação com código, .ics, Google Agenda, WhatsApp, rota |
| Meu agendamento | `src/pages/ManageBooking.tsx` | Consulta por código + telefone e cancelamento dentro da política |
| Área da equipe | `src/pages/Admin.tsx`, `src/components/staff/` (`/equipe`) | Login por usuário e senha, perfis, gestão de acessos; Agenda do dia por barbeiro, **agendar cliente** que ligou ou chegou sem hora (sem a antecedência mínima, telefone opcional), concluir/faltou/cancelar, **bloquear horário, dia inteiro ou um barbeiro** (inclusive vários dias, como férias), aviso dos clientes afetados com link de WhatsApp |
| API da agenda | `server/worker.ts` + `server/api.ts` + `migrations/` | Cloudflare Worker + D1. Usa as mesmas regras de horário do site e grava de forma atômica (sem reserva dupla) |
| Tempo real | `server/hub.ts` + `src/booking/sync.ts` | Durable Object com WebSocket: o servidor avisa todos os aparelhos no instante da mudança (medido: 0,14 s). Se a conexão cair, consulta a cada 3 s e reconecta sozinho |
| WhatsApp, rota, ligar | `src/lib/whatsapp.ts`, `src/lib/maps.ts` | Mensagens contextuais; Google Maps, Waze e Apple Mapas |
| Aberto agora | `src/lib/hours.ts` | Calculado no fuso da barbearia, com datas fechadas |
| SEO | `index.html`, `src/lib/seo.ts` | Título, Open Graph e JSON-LD `BarberShop` gerados do mesmo arquivo de configuração |

## Publicar na Cloudflare

O banco **D1 `business-barbearia` já foi criado** na conta Cloudflare, com todas as tabelas (agenda, bloqueios, equipe e sessões). O `wrangler.toml` já aponta para ele.

1. No painel da Cloudflare: **Workers & Pages → Criar → Importar um repositório** e escolha `JoGuilherme036/Business`, branch `business-site` (ou `main`, depois do merge).
2. Nome do projeto: **`business-barbearia`** (igual ao `name` do `wrangler.toml`). Comando de build: `npm run build`. Comando de deploy: `npx wrangler deploy`.
3. **Configurações → Variáveis e segredos → Adicionar** o segredo `ADMIN_TOKEN` (uma chave longa, só sua) e faça um novo deploy.
4. Abra `https://business-barbearia.<sua-conta>.workers.dev/equipe`. No **primeiro acesso**, informe a chave `ADMIN_TOKEN` e crie o usuário administrador. Depois, em **Equipe e acessos**, cadastre cada funcionário com usuário e senha próprios.

Cada `git push` publica sozinho. Para domínio próprio: **Configurações → Domínios e rotas**. Se criar novas migrações no futuro: `npm run db:migrate:remote`.

### Área da equipe (`/equipe`)

- Login com **usuário e senha** por funcionário (perfis Administrador e Barbeiro). Senhas guardadas com PBKDF2-SHA256 (100 mil iterações) e sal; a sessão é um token aleatório guardado só como hash.
- 5 tentativas erradas bloqueiam a conta por 15 minutos. Desativar um acesso ou trocar a senha encerra as sessões abertas.
- Agenda do dia por barbeiro, agendar cliente (telefone opcional), concluir/faltou/cancelar, bloqueios de horário, dia ou barbeiro.
- **Tempo real**: toda mudança é avisada a todos os aparelhos pelo Durable Object (WebSocket), em menos de 1 segundo.
- **Sem reserva dupla**: a gravação é atômica no D1 (`INSERT … WHERE NOT EXISTS` + índice único por barbeiro e horário). Se duas pessoas tentarem o mesmo horário ao mesmo tempo, só uma consegue.

### Testar o servidor localmente

```bash
npm run build && npm run db:migrate:local
echo "ADMIN_TOKEN=chave-teste-123" > .dev.vars
npm run worker:dev            # outro terminal:
node scripts/e2e-api.mjs      # 32 verificações: login, permissões, tempo real, 25 reservas simultâneas
```

## Antes de publicar (checklist do dono)

1. **Dados reais** em `src/config/site.ts` (nome, WhatsApp, endereço, coordenadas, horários, datas fechadas) e troque `demo: true` por `false`.
2. **Catálogo e equipe** em `src/config/catalog.ts`; planos, FAQ e textos em `src/config/content.ts`.
3. **Fotos reais**: as imagens atuais são ilustrativas (geradas por IA, no padrão visual da marca). Troque por fotos reais da equipe, do espaço e dos produtos (veja `docs/MEDIA_GUIDE.md`). Os produtos usam recortes da foto da bancada; preencha `image` em `src/config/products.ts` com a foto real de cada um.
3a. **Produtos**: edite `src/config/products.ts` (nome, preço, tamanho, descrição, kits).
4. **Acesso da equipe**: defina o segredo `ADMIN_TOKEN` na Cloudflare, crie o administrador em `/equipe` e cadastre os funcionários.
5. **Domínio**: atualize `site.url`, `public/robots.txt` e `public/sitemap.xml`.
6. Revise `src/pages/Privacy.tsx` e as políticas de atraso/cancelamento.

## Visualização sem servidor

`npm run build:preview` gera `dist-preview/` com caminhos relativos e navegação por hash, para abrir o site em qualquer subpasta.

## Hospedagem

Cloudflare Workers com arquivos estáticos (veja acima): o Worker só é acionado em `/api/*`; o resto é servido direto do cache da Cloudflare, sem custo de requisição. `public/_headers` define o cache dos arquivos.

## Regenerar mídia

As fotos, os recortes de produtos e os quadros da introdução (zoom lento + fusão entre as fotos) saem de um único script:

```bash
pip install pillow
python3 scripts/build-assets.py <pasta-com-as-10-imagens-png> <video-de-abertura.mp4>   # MONO=1 deixa as fotos em P&B
```

Gera `public/media/img/*`, `frames/`, `poster-*`, `end-*`, `og-image.jpg` e `src/data/media.json` / `frames.json`.

## Documentação

- `docs/DESIGN_SYSTEM.md`: cores, tipografia, espaçamento, componentes e motion
- `docs/MEDIA_GUIDE.md`: espaços de imagem, proporções e como substituir
- `docs/BOOKING.md`: regras de agendamento, estados e backend
- `docs/COMPONENT_SOURCES.md`: referências usadas (21st.dev) e adaptações
- `docs/prompts/`: os prompts mestres que guiaram o projeto
