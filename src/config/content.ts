// Editorial content. Edit freely; only publish policies the shop has approved.

export const ritualSteps = [
  { n: '01', title: 'Recepção', text: 'Café, conversa e a consulta de imagem: entendemos o que combina com você.', image: 'salao-vazio' },
  { n: '02', title: 'Lavagem', text: 'Lavatório com massagem no couro cabeludo para começar o atendimento relaxado.', image: 'lavagem' },
  { n: '03', title: 'Corte', text: 'Tesoura, máquina e acabamento milimétrico, com o tempo que o resultado pede.', image: 'corte' },
  { n: '04', title: 'Barba e finalização', text: 'Toalha quente, navalha e produtos da linha Business para sair pronto.', image: 'barba' },
] as const;

export const clubPlans = [
  // DEMO: publish only real plans and prices.
  { id: 'essencial', name: 'Essencial', price: 'R$ 129/mês', perks: ['2 cortes por mês', 'Agendamento prioritário', 'Cortesia da casa'] },
  { id: 'completo', name: 'Completo', price: 'R$ 219/mês', perks: ['Cortes ilimitados*', '2 barbas por mês', 'Prioridade em encaixes', '10% nos produtos Business'], highlight: true },
] as const;

export const amenities = [
  { title: 'Cortesia da casa', text: 'Café, bebidas geladas e um cantinho de doces para quem espera ou relaxa.' },
  { title: 'Lavatório confortável', text: 'Cadeiras reclináveis e massagem no couro cabeludo.' },
  { title: 'Ambiente climatizado', text: 'Espaço amplo, com cadeiras bem distribuídas e atendimento sem aperto.' },
] as const; // DEMO: confirm with the owner

export const faq = [
  { q: 'Como faço para agendar?', a: 'Toque em “Agendar”, escolha o serviço, o barbeiro (ou “primeiro disponível”), o dia e o horário. Leva menos de um minuto e não precisa criar conta.' },
  { q: 'Posso remarcar ou cancelar?', a: 'Sim. Use o código que aparece na confirmação em “Meu agendamento” ou fale com a gente no WhatsApp. Cancelamentos são gratuitos até 2 horas antes.' },
  { q: 'E se eu me atrasar?', a: 'Temos tolerância de 10 minutos. Depois disso, podemos precisar reduzir o serviço ou remarcar para não atrasar o próximo cliente.' },
  { q: 'Como compro os produtos?', a: 'Monte a sacola em “Produtos”, envie o pedido pelo WhatsApp e retire na barbearia. O pagamento é feito na retirada, e você pode aproveitar para pedir uma demonstração.' },
  { q: 'Quais formas de pagamento vocês aceitam?', a: 'Pix, cartões de débito e crédito e dinheiro. O pagamento é feito na barbearia, depois do atendimento.' },
  { q: 'Vocês atendem sem horário marcado?', a: 'Atendemos encaixes quando há cadeira livre. Chame no WhatsApp antes de vir para confirmar.' },
] as const; // DEMO: confirm each policy with the owner
