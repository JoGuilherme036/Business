import { site } from '@/config/site';

export const whatsappLink = (text: string, number: string = site.contact.whatsapp) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const waMessages = {
  general: () => `Olá! Vim pelo site e gostaria de saber mais sobre os serviços da ${site.name}.`,
  service: (service: string) => `Olá! Tenho interesse em *${service}*. Quais horários vocês têm?`,
  professional: (name: string) => `Olá! Gostaria de agendar com o *${name}*.`,
  plan: (plan: string) => `Olá! Quero saber mais sobre o plano *${plan}* do clube.`,
  product: (product: string) => `Olá! Vocês têm *${product}* disponível?`,
  order: (lines: { name: string; qty: number; priceCents: number }[], totalCents: number) => {
    const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const rows = lines.map((l) => `• ${l.qty}x ${l.name} — ${brl(l.qty * l.priceCents)}`).join('\n');
    return `Olá! Quero reservar estes produtos da ${site.name}:\n\n${rows}\n\n*Total: ${brl(totalCents)}*\n\nPosso retirar na barbearia?`;
  },
  /** Team → client, after confirming an online request. */
  requestConfirmed: (b: { name: string; date: string; time: string; pro: string; services: string }) =>
    `Olá, ${b.name}! Aqui é da ${site.name}. Seu horário está confirmado: *${b.services}*, ${b.date} às ${b.time}, com ${b.pro}. Qualquer coisa, é só chamar por aqui.`,
  /** Team → client, when the requested time does not work. */
  requestDeclined: (b: { name: string; date: string; time: string }) =>
    `Olá, ${b.name}! Aqui é da ${site.name}. Recebemos seu pedido para ${b.date} às ${b.time}, mas esse horário não vai dar. Podemos combinar outro por aqui?`,
  /** Client → shop or barber, to schedule by conversation. */
  schedule: (pro?: string) => (pro ? `Olá! Quero agendar um horário com o *${pro}*.` : `Olá! Quero agendar um horário na ${site.name}.`),
  booking: (b: { code: string; date: string; time: string; pro: string; services: string }) =>
    `Olá! Meu agendamento é *${b.code}*: ${b.services}, ${b.date} às ${b.time}, com ${b.pro}.`,
};
