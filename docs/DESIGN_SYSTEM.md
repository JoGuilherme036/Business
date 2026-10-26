# Design system — "Ateliê noturno"

Conceito: um ateliê de barbearia à noite, com mármore escuro, couro, latão e luz âmbar. Ele vem direto do vídeo de fundo. A marca precisa continuar reconhecível com as animações desligadas.

## Cores (`src/styles/index.css`)

| Token | RGB | Uso |
|---|---|---|
| `--ink` | 11 9 7 | Fundo principal (preto quente) |
| `--ink-2` / `--ink-3` | 20 16 12 / 31 25 20 | Superfícies, cartões |
| `--ivory` | 242 234 223 | Texto principal |
| `--muted` | 176 163 148 | Texto secundário (≈ 8:1 sobre `ink`) |
| `--brass` | 205 154 94 | Acento, CTA principal, estados ativos |
| `--brass-light` / `--brass-deep` | 232 194 140 / 140 96 52 | Gradiente do latão, preços |
| `--moss` | 38 63 54 | Apoio frio (reflexos 3D) |
| `--danger` | 236 128 104 | Erros |

Texto escuro sobre latão nos botões primários; nunca latão sobre latão.

## Tipografia

- **Bodoni Moda** (display, alto contraste; itálico para ênfase em latão): títulos, preços, números de capítulo.
- **Manrope** (texto e interface).
- Escala fluida com `clamp()`; campos de formulário com 16 px, para o iPhone não dar zoom.

## Estrutura narrativa

A animação é exclusiva da introdução (cerca de uma tela de rolagem): o título fica sobre uma camada escura própria e passa a vez para duas legendas. Assim que o vídeo chega ao fim, a agenda sobe como uma lâmina por cima do último quadro, sem tela vazia entre o vídeo e o conteúdo. Daí em diante tudo fica sobre fundo sólido, alternando o preto principal com "lâminas" (`.slab`, bordas arredondadas) em Serviços, Espaço e Localização/Dúvidas. O epílogo reaproveita o último quadro do vídeo como imagem parada, fechando o ciclo.

Os capítulos são numerados em romano (I–XI). Cada título de capítulo tem o fio e o brilho de uma luminária pendente, o mesmo elemento das luzes âmbar do vídeo.

## Elementos de assinatura

- **Comanda**: recibo em marfim com bordas picotadas, a única área clara do site; lista os serviços escolhidos, tempo e total.
- **Agenda ao vivo**: horários em placas com a "dobra" central de um painel de letras, que viram ao trocar o serviço.
- **Poltrona com pontos**: foto da cadeira com quatro pontos tocáveis que explicam cada parte.

## Componentes base (`src/components/ui`)

`Button` / `LinkButton` / `ExternalButton` (primary, ghost, quiet; alvo mínimo de 48 px), `Icon` (traço fino de 1.5 px), `SmartImage` (srcset, proporção reservada, placeholder), `Reveal` / `MaskLines` / `ScrollWords` (motion), `SectionHeading`, `Monogram`.

## Motion

| Interação | Duração | Curva |
|---|---|---|
| Pressionar botão | 200 ms, escala 0.97 | expo-out |
| Accordion / menu | 280–600 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Troca de etapa do agendamento | 280 ms, ±36 px com direção | expo-out |
| Entrada de bloco | 700 ms, 18 px | expo-out |
| Títulos | máscara por linha, 900 ms, stagger de 80 ms | expo-out |
| Vídeo da introdução | interpolação de 16% por frame até a posição do scroll | — |

Sem scroll-jacking, sem cursor customizado e sem parallax forte no celular. Com `prefers-reduced-motion` ou com o botão "Reduzir animações" no rodapé, a introdução deixa de ser fixa e mostra um poster estático, a medalha fica parada e as transições perdem o deslocamento.
