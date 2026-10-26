import { site } from '@/config/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// DEMO: review this text with the owner (and legal counsel) before publishing.
export default function Privacy() {
  useDocumentTitle('Privacidade');
  return (
    <main id="conteudo" className="container-x relative z-10 min-h-[100svh] max-w-3xl pb-32 pt-28 md:pt-36">
      <p className="eyebrow">Privacidade</p>
      <h1 className="display mt-4 text-[clamp(2.6rem,10vw,4rem)]">Seus dados, <em className="brass-text">com cuidado.</em></h1>
      <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-ivory/85">
        <p>Esta página explica como a {site.name} trata as informações que você fornece ao agendar pelo site.</p>
        <h2 className="font-display text-2xl italic text-ivory">O que coletamos</h2>
        <p>Nome, número de WhatsApp e, se você quiser, e-mail e observações. Também registramos o serviço, o barbeiro, a data e o horário escolhidos.</p>
        <h2 className="font-display text-2xl italic text-ivory">Para que usamos</h2>
        <p>Somente para confirmar, lembrar, remarcar ou cancelar o seu atendimento. Não vendemos nem compartilhamos seus dados para publicidade.</p>
        <h2 className="font-display text-2xl italic text-ivory">Cookies e métricas</h2>
        <p>O site não usa cookies de rastreamento. O mapa do Google só é carregado se você tocar em “Mostrar mapa”. Links para WhatsApp, Instagram e aplicativos de rota levam a serviços de terceiros com políticas próprias.</p>
        <h2 className="font-display text-2xl italic text-ivory">Seus direitos</h2>
        <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail <a className="text-brass-light underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> ou pelo WhatsApp.</p>
        {site.demo && <p className="rounded-xl border border-brass/30 bg-brass/10 px-4 py-3 text-[13px] text-brass-light">Versão de demonstração: as reservas feitas aqui ficam salvas apenas no seu aparelho.</p>}
      </div>
    </main>
  );
}
