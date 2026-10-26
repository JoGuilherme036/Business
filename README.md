# Business Barbearia — site premium com agendamento e catálogo de produtos

Site mobile-first da **Business Barbearia** (Teresina/PI), no tema **preto e branco**, com a tipografia expandida do letreiro: introdução em que as cenas avançam conforme a rolagem (gerada a partir das fotos da marca), agenda ao vivo, serviços com comanda, **catálogo de produtos com sacola e reserva pelo WhatsApp**, agendamento completo, painel da barbearia e planos do clube.

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
| Painel da barbearia | `src/pages/Admin.tsx` (`/admin`) | Agenda do dia por barbeiro, **agendar cliente** que ligou ou chegou sem hora (sem a antecedência mínima, telefone opcional), concluir/faltou/cancelar, **bloquear horário, dia inteiro ou um barbeiro** (inclusive vários dias, como férias), aviso dos clientes afetados com link de WhatsApp |
| API da agenda | `server/worker.ts` + `server/api.ts` + `migrations/` | Cloudflare Worker + D1. Usa as mesmas regras de horário do site e grava de forma atômica (sem reserva dupla) |
| Tempo real | `server/hub.ts` + `src/booking/sync.ts` | Durable Object com WebSocket: o servidor avisa todos os aparelhos no instante da mudança (medido: 0,14 s). Se a conexão cair, consulta a cada 3 s e reconecta sozinho |
| WhatsApp, rota, ligar | `src/lib/whatsapp.ts`, `src/lib/maps.ts` | Mensagens contextuais; Google Maps, Waze e Apple Mapas |
| Aberto agora | `src/lib/hours.ts` | Calculado no fuso da barbearia, com datas fechadas |
| SEO | `index.html`, `src/lib/seo.ts` | Título, Open Graph e JSON-LD `BarberShop` gerados do mesmo arquivo de configuração |

## Publicar na Cloudflare (uma vez)

Este projeto tem banco próprio: crie-o com `npx wrangler d1 create business-barbearia`, cole o `database_id` no `wrangler.toml` e aplique as tabelas com `npm run db:migrate:remote`.

1. No painel da Cloudflare: **Workers & Pages → Criar → Importar um repositório** e escolha `business`.
2. Nome do projeto: **`business-barbearia`** (precisa ser igual ao `name` do `wrangler.toml`). Comando de build: `npm run build`. Comando de deploy: `npx wrangler deploy` (padrão).
3. Depois do primeiro deploy: **Configurações → Variáveis e segredos → Adicionar** um segredo `ADMIN_TOKEN` com a senha do painel, e faça um novo deploy.
4. Pronto: o site fica em `https://business-barbearia.<sua-conta>.workers.dev` e o painel em `/admin`. Cada `git push` na `main` publica sozinho. Para usar um domínio próprio: **Configurações → Domínios e rotas**.

Para testar tudo localmente: `npm run build && npm run db:migrate:local && npm run worker:dev` (crie `.dev.vars` com `ADMIN_TOKEN=uma-senha`).

## Antes de publicar (checklist do dono)

1. **Dados reais** em `src/config/site.ts` (nome, WhatsApp, endereço, coordenadas, horários, datas fechadas) e troque `demo: true` por `false`.
2. **Catálogo e equipe** em `src/config/catalog.ts`; planos, FAQ e textos em `src/config/content.ts`.
3. **Fotos reais**: as imagens atuais são ilustrativas (geradas por IA, no padrão visual da marca). Troque por fotos reais da equipe, do espaço e dos produtos (veja `docs/MEDIA_GUIDE.md`). Os produtos usam recortes da foto da bancada; preencha `image` em `src/config/products.ts` com a foto real de cada um.
3a. **Produtos**: edite `src/config/products.ts` (nome, preço, tamanho, descrição, kits).
4. **Senha do painel**: defina o segredo `ADMIN_TOKEN` na Cloudflare (veja acima). Use uma senha longa.
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
python3 scripts/build-assets.py <pasta-com-as-6-imagens-png>   # MONO=0 mantém as fotos coloridas
```

Gera `public/media/img/*`, `frames/`, `poster-*`, `end-*`, `og-image.jpg` e `src/data/media.json` / `frames.json`.

## Documentação

- `docs/DESIGN_SYSTEM.md`: cores, tipografia, espaçamento, componentes e motion
- `docs/MEDIA_GUIDE.md`: espaços de imagem, proporções e como substituir
- `docs/BOOKING.md`: regras de agendamento, estados e backend
- `docs/COMPONENT_SOURCES.md`: referências usadas (21st.dev) e adaptações
- `docs/prompts/`: os prompts mestres que guiaram o projeto
