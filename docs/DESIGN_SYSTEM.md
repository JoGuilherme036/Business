# Design system — "Business"

Conceito: **corporativo premium em preto e branco**. Seções pretas intercaladas com seções brancas (`.theme-light`, que inverte os tokens), fotos em cores, tipografia expandida como o letreiro BUSINESS e botões retos brancos. Sem dourado e sem elementos 3D.

## Cores (`src/styles/index.css`)

| Token | RGB | Uso |
|---|---|---|
| `--ink` | 0 0 0 | Fundo principal (preto total) |
| `--ink-2` / `--ink-3` | 11 11 11 / 22 22 22 | Superfícies, cartões, comanda |
| `--ivory` | 255 255 255 | Texto principal e botão primário |
| `--muted` | 150 150 150 | Texto secundário |
| `--accent` / `--accent-light` | 255 255 255 | Mantidos por compatibilidade: agora são branco |
| `--accent-deep` | 140 140 140 | Cinza de apoio |
| `--steel` | 96 96 100 | Apoio neutro (reflexos 3D) |
| `--danger` | 255 140 120 | Erros |

A única cor fora do preto e branco é o verde do "Aberto agora" (estado). O plano em destaque do clube é invertido (cartão branco).

## Tipografia

- **Archivo** (variável, largura até 125%): a mesma família em todo o site. Títulos e logotipo em largura expandida e peso alto, como o letreiro; ênfase em peso leve e cinza; texto corrido em largura normal.
- Logotipo: componente `Logo` (BUSINESS / BARBEARIA espaçado).
- Hero: título em caixa alta, última linha vazada (`.outline-text`).

## Formas

Cantos pequenos (`rounded-lg`/`rounded-[3px]` nos botões), bordas finas `hairline` (branco 12%) e a superfície `.glass` para cartões de produto. Divisória de assinatura: `.pole` (fio de luz).

## Estrutura narrativa

Introdução fixa de ~1 tela de rolagem (cenas geradas das fotos: salão → barbeiro → cadeira → lavagem → bancada), seguida da agenda ao vivo, manifesto, serviços com comanda, experiência (4 etapas), **produtos**, barbeiros, espaço, clube, localização, dúvidas e epílogo.

## Elementos de assinatura

- **Comanda**: recibo escuro com bordas picotadas; lista serviços, tempo e total.
- **Agenda ao vivo**: próximos horários livres do serviço escolhido.
- **Catálogo**: cartões `ProductCard`, detalhe em modal (`ProductDialog`) e sacola lateral (`CartDrawer`).
- **Barra de informações** no rodapé da tela inicial: status, próximo horário, endereço e horários.

## Motion

| Interação | Duração | Curva |
|---|---|---|
| Pressionar botão | 200 ms, escala 0.97 | expo-out |
| Modal / sacola | 450–500 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Entrada de bloco | 700 ms, 18 px | expo-out |
| Títulos | máscara por linha, 900 ms, stagger de 80 ms | expo-out |
| Introdução | interpolação de 16% por frame até a posição do scroll | — |

Com `prefers-reduced-motion` ou o botão "Reduzir animações" no rodapé, a introdução deixa de ser fixa e mostra um poster estático.
