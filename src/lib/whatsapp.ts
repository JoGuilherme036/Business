import { site } from '@/config/site';

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;

export const waMessages = {
  general: () => `Olá! Vim pelo site e gostaria de saber mais sobre os serviços da ${site.name}.`,
  service: (service: string) => `Olá! Tenho interesse em *${service}*. Quais horários vocês têm?`,
  professional: (name: string) => `Olá! Gostaria de agendar com o *${name}*.`,
  plan: (plan: string) => `Olá! Quero saber mais sobre o plano *${plan}* do clube.`,
  product: (product: string) => `Olá! Vocês têm *${product}* disponível?`,
  booking: (b: { code: string; date: string; time: string; pro: string; services: string }) =>
    `Olá! Meu agendamento é *${b.code}*: ${b.services}, ${b.date} às ${b.time}, com ${b.pro}.`,
};
