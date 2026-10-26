// Editorial content. Edit freely; only publish policies the shop has approved.

export const ritualSteps = [
  { n: '01', title: 'Recepção', text: 'Café ou uma dose, conversa rápida e a escolha do que você quer hoje.', image: 'ambiente-principal' },
  { n: '02', title: 'Toalha quente', text: 'Vapor e calor abrem os poros e preparam a pele para a navalha.', image: 'ritual-toalha' },
  { n: '03', title: 'Ofício', text: 'Tesoura, máquina e navalha. Sem pressa, com medida.', image: 'servico-barba' },
  { n: '04', title: 'Acabamento', text: 'Bálsamo, pomada e a última olhada no espelho antes de sair.', image: 'ritual-bancada' },
] as const;

export const styles = [
  { id: 'servico-corte', title: 'Fade natural', tag: 'Fade' },
  { id: 'estilo-cachos', title: 'Cachos com taper', tag: 'Crespo e cacheado' },
  { id: 'estilo-classico', title: 'Clássico grisalho', tag: 'Tesoura' },
  { id: 'estilo-ondulado', title: 'Ondulado editorial', tag: 'Tesoura' },
  { id: 'estilo-barba', title: 'Corte e barba', tag: 'Barba' },
  { id: 'servico-barba', title: 'Barba desenhada', tag: 'Barba' },
] as const;

export const clubPlans = [
  // DEMO: publish only real plans and prices.
  { id: 'essencial', name: 'Essencial', price: 'R$ 129/mês', perks: ['2 cortes por mês', 'Agendamento prioritário', 'Bebida da casa'] },
  { id: 'completo', name: 'Completo', price: 'R$ 219/mês', perks: ['Cortes ilimitados*', '2 barbas ritual por mês', 'Prioridade em encaixes', '10% em produtos'], highlight: true },
] as const;

export const faq = [
  { q: 'Como faço para agendar?', a: 'Toque em “Agendar”, escolha o serviço, o barbeiro (ou “primeiro disponível”), o dia e o horário. Leva menos de um minuto e não precisa criar conta.' },
  { q: 'Posso remarcar ou cancelar?', a: 'Sim. Use o código que aparece na confirmação em “Meu agendamento” ou fale com a gente no WhatsApp. Cancelamentos são gratuitos até 2 horas antes.' },
  { q: 'E se eu me atrasar?', a: 'Temos tolerância de 10 minutos. Depois disso, podemos precisar reduzir o serviço ou remarcar para não atrasar o próximo cliente.' },
  { q: 'Quais formas de pagamento vocês aceitam?', a: 'Pix, cartões de débito e crédito e dinheiro. O pagamento é feito na barbearia, depois do atendimento.' },
  { q: 'Vocês atendem sem horário marcado?', a: 'Atendemos encaixes quando há cadeira livre. Chame no WhatsApp antes de vir para confirmar.' },
  { q: 'Atendem cabelo crespo e cacheado?', a: 'Sim. Temos barbeiros especializados em fade, taper e definição de cachos.' },
] as const; // DEMO: confirm each policy with the owner
