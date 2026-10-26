# Guia de mídia

As imagens ficam em `public/media/img/<id>-<largura>.webp` e são descritas em `src/data/media.json` (gerado pelo script). Os componentes referenciam só o **id**: para trocar uma foto, gere de novo com o mesmo id.

## Imagens atuais

Origem: 6 imagens ilustrativas (geradas por IA no padrão visual da marca). **Troque por fotos reais** assim que possível.

| id | Onde aparece | Observação |
|---|---|---|
| `salao-vazio` | Experiência (01), mapa, 1ª cena da introdução | 16:9 |
| `salao-barbeiro` | Serviço "Degradê", espaço, 2ª cena | 16:9 |
| `corte` | Serviços de corte, experiência (03), 3ª cena | 4:5 |
| `barba` | Barba, experiência (04) | 4:5 |
| `lavagem` | Lavagem, espaço, experiência (02), 4ª cena | 4:5 |
| `bancada` | Última cena da introdução e epílogo | 4:5 |
| `produto-*` | Catálogo de produtos | Recortes 4:5 da foto `bancada` |
| *(faltando)* `barbeiro-<id>` | Cards da equipe | Retrato real; depois preencha `photo` em `catalog.ts` |

## Introdução

- `public/media/frames/portrait/000–071.webp` (540×960) e `landscape/` (1280×720), gerados por `scripts/build-assets.py` com zoom lento e fusão entre as fotos. O site decodifica só os quadros próximos da rolagem.
- `poster-*.webp` é o primeiro quadro (e a imagem fixa com movimento reduzido); `end-*.webp` é o fundo do epílogo.
- Para usar vídeo real, gere os quadros com `ffmpeg -i video.mp4 -vf fps=9,scale=540:960 %03d.png` e converta para WebP (72 quadros).

## Regras

- Não coloque texto nem botões dentro das imagens.
- Fotos de equipe, fachada e resultados devem ser reais quando apresentadas como trabalho da casa.
- Origem recomendada: 1600–2000 px de largura nas imagens amplas e 1100–1200 px nos retratos.
