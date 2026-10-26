# Guia de mídia

As imagens ficam em `public/media/img/<id>-<largura>.webp` e são descritas em `src/data/media.json` (gerado pelo script). Os componentes referenciam só o **id**: para trocar uma foto, gere de novo com o mesmo id.

## Imagens atuais

Origem: 10 imagens ilustrativas (geradas por IA no padrão visual da marca), em cores. Troque por fotos reais quando possível.

| id | Onde aparece |
|---|---|
| `salao` | O espaço, mapa, Open Graph |
| `corte`, `finalizacao`, `resultado`, `barba`, `navalha`, `lavagem`, `consultoria` | Serviços, experiência, espaço |
| `bancada`, `bancada-barba` | Fotos de onde saem os recortes de produto |
| `produto-*` | Catálogo de produtos (recortes 4:5) |
| *(faltando)* `barbeiro-<id>` | Cards da equipe: retrato real; depois preencha `photo` em `catalog.ts` |

## Introdução

- Vídeo de abertura (máquina que se desmonta e forma o logotipo BUSINESS), convertido em 96 quadros WebP (12 por segundo): `frames/landscape/` 1280×720 e `frames/portrait/` 540×960 (o vídeo ampliado sobre uma cópia desfocada dele mesmo).
- Os quadros avançam conforme a rolagem; no fim, o logotipo formado vira o fundo do título e dos botões.
- `poster-*.webp` é o primeiro quadro; `end-*.webp` é o último (logotipo), usado também com movimento reduzido e no epílogo.
- Para trocar: `python3 scripts/build-assets.py <pasta-das-imagens> <video.mp4>`.

## Regras

- Não coloque texto nem botões dentro das imagens.
- Fotos de equipe, fachada e resultados devem ser reais quando apresentadas como trabalho da casa.
- Origem recomendada: 1600–2000 px de largura nas imagens amplas e 1100–1200 px nos retratos.
