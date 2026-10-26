# Design system — "Velha Guarda"

Conceito: a barbearia de bairro à moda antiga, à noite: marinho profundo, creme, aço cromado e o vermelho do poste de barbeiro. A divisória listrada (`.pole`) é o elemento de assinatura. Os nomes dos tokens (`brass*`) foram mantidos por compatibilidade, mas agora representam o **vermelho de acento**.

## Cores (`src/styles/index.css`)

| Token | RGB | Uso |
|---|---|---|
| `--ink` | 9 15 28 | Fundo principal (marinho noturno) |
| `--ink-2` / `--ink-3` | 15 24 42 / 24 36 60 | Superfícies, cartões |
| `--ivory` | 244 238 226 | Texto principal (creme) |
| `--muted` | 160 170 188 | Texto secundário |
| `--brass` | 226 78 70 | Acento (vermelho de poste), CTA principal, estados ativos |
| `--brass-light` / `--brass-deep` | 244 128 116 / 168 40 42 | Gradiente do acento, preços |
| `--moss` | 44 78 120 | Azul de apoio (listras e reflexos 3D) |
| `--danger` | 255 150 120 | Erros |

Texto escuro sobre o vermelho nos botões primários; nunca acento sobre acento. Verifique o contraste dos botões ao ajustar o vermelho.

## Tipografia

- **Fraunces** (display serifada "soft"; itálico para ênfase no acento): títulos, preços, números de capítulo.
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
