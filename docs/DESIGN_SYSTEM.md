# Design system — "Business"

Conceito: **corporativo premium em preto total**. Superfícies pretas, tipografia ampla e geométrica (como o logotipo), hairlines de luz champagne que lembram as fitas de LED do salão, e botões retos em marfim.

## Cores (`src/styles/index.css`)

| Token | RGB | Uso |
|---|---|---|
| `--ink` | 0 0 0 | Fundo principal (preto total) |
| `--ink-2` / `--ink-3` | 11 11 11 / 22 22 22 | Superfícies, cartões, comanda |
| `--ivory` | 246 245 242 | Texto principal e botão primário |
| `--muted` | 152 152 150 | Texto secundário |
| `--accent` | 214 184 138 | Champagne: eyebrows, estados ativos, preços |
| `--accent-light` / `--accent-deep` | 238 218 178 / 150 118 74 | Gradiente do acento |
| `--steel` | 96 96 100 | Apoio neutro (reflexos 3D) |
| `--danger` | 255 140 120 | Erros |

O botão primário é **marfim com texto preto**; o champagne é reservado a detalhes, para manter o tom sóbrio.

## Tipografia

- **Syne** (display, ampla e geométrica): títulos, preços, nome da marca em caixa alta com tracking.
- **Instrument Serif itálico**: palavras de ênfase em champagne (`<em class="accent-text">`), em contraste com a Syne.
- **Manrope**: texto e interface. Campos de formulário com 16 px (sem zoom no iPhone).

## Formas

Cantos pequenos (`rounded-lg`/`rounded-[3px]` nos botões), bordas finas `hairline` (branco 12%) e a superfície `.glass` para cartões de produto. Divisória de assinatura: `.pole` (fio de luz).

## Estrutura narrativa

Introdução fixa de ~1 tela de rolagem (cenas geradas das fotos: salão → barbeiro → cadeira → lavagem → bancada), seguida da agenda ao vivo, manifesto, serviços com comanda, experiência (4 etapas), **produtos**, barbeiros, espaço, clube (medalha 3D), localização, dúvidas e epílogo.

## Elementos de assinatura

- **Comanda**: recibo escuro com bordas picotadas; lista serviços, tempo e total.
- **Agenda ao vivo**: próximos horários livres do serviço escolhido.
- **Catálogo**: cartões `ProductCard`, detalhe em modal (`ProductDialog`) e sacola lateral (`CartDrawer`).
- **Medalha 3D** champagne (React Three Fiber), com fallback em SVG.

## Motion

| Interação | Duração | Curva |
|---|---|---|
| Pressionar botão | 200 ms, escala 0.97 | expo-out |
| Modal / sacola | 450–500 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Entrada de bloco | 700 ms, 18 px | expo-out |
| Títulos | máscara por linha, 900 ms, stagger de 80 ms | expo-out |
| Introdução | interpolação de 16% por frame até a posição do scroll | — |

Com `prefers-reduced-motion` ou o botão "Reduzir animações" no rodapé, a introdução deixa de ser fixa e mostra um poster estático.
