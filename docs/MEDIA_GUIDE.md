# Guia de mídia

As imagens ficam em `public/media/img/<id>-<largura>.webp` e são descritas em `src/data/media.json` (gerado pelo script). Os componentes referenciam só o **id**: para trocar uma foto, gere de novo com o mesmo id.

## Espaços atuais

| id | Onde aparece | Proporção de origem | Observação |
|---|---|---|---|
| `servico-corte` | Serviço "Fade", estilos | 4:5 | |
| `servico-barba` | Serviço "Barba ritual", ritual (03), estilos | 4:5 | |
| `estilo-barba` | Combo, estilos | 4:5 | |
| `estilo-cachos` / `estilo-classico` / `estilo-ondulado` | Estilos, serviços | 4:5 | **Ilustrativas**: troque por trabalhos reais |
| `ambiente-principal` | O espaço, ritual (01) | 16:9 | Ideal: foto real do salão |
| `poltrona-vertical` | Poltrona com pontos interativos (O espaço) | 9:16 | Se trocar a foto, ajuste as posições dos pontos em `Space.tsx` |
| `poltrona-horizontal` | Mapa (antes de carregar) | 16:9 | |
| `produto-pomada` | "Na bancada" | 1:1 | |
| `ritual-toalha` / `ritual-bancada` | Ritual (02, 04), espaço | 3:2 | |
| *(faltando)* `barbeiro-<id>` | Cards da equipe | 4:5 | Retrato real; depois preencha `photo: 'barbeiro-<id>'` em `catalog.ts` |
| *(faltando)* `fachada` | Localização | 3:2 | Entrada real, reconhecível por quem chega |

## Animação da introdução

- `public/media/frames/portrait/000–071.webp` (540×960, ~2 MB no total) para telas em pé e `landscape/` (1280×720) para telas deitadas.
- O site baixa os quadros como arquivos pequenos e só decodifica os que estão perto da posição da rolagem (mais um a cada 8), por isso a memória fica baixa mesmo no celular. Entre dois quadros vizinhos ele faz uma fusão suave.
- Usamos imagens e não vídeo porque no iPhone e nos navegadores internos do Instagram/WhatsApp o vídeo não carrega sem um toque.
- `poster-*.webp` (primeiro quadro) aparece na hora e é a imagem fixa com movimento reduzido. `end-*.webp` (último quadro) é o fundo do epílogo e da tela de agendamento.
- Para trocar, rode o script com os dois vídeos novos (8 s funcionam bem; pense o movimento de câmera como uma jornada do salão até a bancada).

## Regras

- Não coloque texto nem botões dentro das imagens.
- Fotos de equipe, fachada e resultados devem ser reais quando apresentadas como trabalho da casa.
- Origem recomendada: 1600–2000 px de largura nas imagens amplas e 1100–1200 px nos retratos.
