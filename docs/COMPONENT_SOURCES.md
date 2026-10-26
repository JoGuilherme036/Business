# Referências de componentes

Os padrões abaixo foram pesquisados no catálogo do 21st.dev e **reimplementados do zero** com os tokens, o motion e a acessibilidade do projeto. Nenhum código foi copiado.

| Referência (21st.dev) | Usado em | Adaptação |
|---|---|---|
| *Image Sequence* (joyco): canvas com carregamento progressivo | `ScrollFilm` | Decodificação só dos quadros próximos (ImageBitmap fora da thread principal), fusão entre quadros vizinhos, ligado só à introdução, troca vertical/horizontal, modo economia de dados, poster para movimento reduzido |
| *Editorial service list* (ibrandify): lista numerada em accordion | `Services` | Preço e duração sempre visíveis, filtros por categoria, foto fixa no desktop, CTA que pré-seleciona o serviço |
| *Booking Slot Calendar* (bidyut10): faixa de dias + horários | `TimeStep` | Horários agrupados em manhã, tarde e noite, estados de carregamento, vazio e erro, "próximo dia com vaga" |

O link de referência do dono (`naocodei.com/free-code`) não pôde ser acessado a partir do ambiente de desenvolvimento.
