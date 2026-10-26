import { useState } from 'react';
import { fullAddress, site } from '@/config/site';
import { formatRanges } from '@/lib/hours';
import { mapLinks } from '@/lib/maps';
import { shopNow, weekdayNames } from '@/lib/time';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { useOpenStatus } from '@/hooks/useMisc';
import { statusLabel } from '@/lib/hours';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Reveal } from '../ui/Reveal';
import { Icon, type IconName } from '../ui/Icon';

export function Location() {
  const status = useOpenStatus();
  const label = statusLabel(status);
  const [copied, setCopied] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const today = shopNow().weekday;
  const order = [1, 2, 3, 4, 5, 6, 0] as const;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked: the address stays selectable */
    }
  };

  return (
    <section id="local" aria-labelledby="local-title" className="relative z-10 scroll-mt-20 rounded-t-[2rem] bg-ink-2 pb-20 pt-20 md:rounded-t-[3rem] md:pb-28 md:pt-28">
      <div className="container-x" id="local-title">
        <SectionHeading chapter="IX" label="Localização" lines={['Venha', <em key="e" className="brass-text">sentar com a gente.</em>]} />
      </div>

      <div className="container-x mt-12 grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        <Reveal className="flex flex-col gap-4">
          <div className="rounded-3xl border hairline bg-ink p-6 md:p-8">
            <p className="flex items-center gap-3" aria-live="polite">
              <span className="relative flex h-3 w-3">
                {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
                <span className={`relative inline-flex h-3 w-3 rounded-full ${status.open ? 'bg-emerald-400' : 'bg-muted'}`} />
              </span>
              <span className="font-display text-3xl italic">{label.short}</span>
              <span className="text-sm text-muted">{label.detail}</span>
            </p>

            <address className="mt-6 select-text not-italic">
              <span className="block text-lg">{site.address.street}</span>
              <span className="block text-muted">
                {site.address.district}, {site.address.city}/{site.address.state} · {site.address.zip}
              </span>
            </address>
            <p className="mt-3 text-sm text-muted">{site.address.reference}</p>
            <p className="mt-1 text-sm text-muted">{site.address.parking}</p>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <RouteBtn href={mapLinks.google} label="Google Maps" icon="route" />
              <RouteBtn href={mapLinks.waze} label="Waze" icon="route" />
              <RouteBtn href={mapLinks.apple} label="Apple Mapas" icon="route" />
              <button onClick={copy} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border hairline text-[12px] transition-colors hover:border-brass/60">
                <Icon name={copied ? 'check' : 'copy'} className={`h-[18px] w-[18px] ${copied ? 'text-emerald-400' : ''}`} />
                <span aria-live="polite">{copied ? 'Copiado!' : 'Copiar endereço'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border hairline bg-ink p-6 md:p-8">
            <p className="eyebrow">Horários</p>
            <dl className="mt-4 divide-y divide-brass/10">
              {order.map((d) => (
                <div key={d} className={`flex items-center justify-between py-2.5 text-[15px] ${d === today ? 'text-ivory' : 'text-muted'}`}>
                  <dt className="flex items-center gap-2">
                    {weekdayNames[d]}
                    {d === today && <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brass-light">Hoje</span>}
                  </dt>
                  <dd className="tabular-nums">{formatRanges(site.hours[d])}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-4">
          <div className="relative min-h-[22rem] flex-1 overflow-hidden rounded-3xl border hairline">
            {showMap ? (
              <iframe title={`Mapa: ${site.name}`} src={mapLinks.embed} className="absolute inset-0 h-full w-full grayscale-[0.6] invert-[0.9] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <>
                <SmartImage id="poltrona-horizontal" alt="" sizes="(min-width: 1024px) 45vw, 100vw" className="!absolute inset-0 h-full !aspect-auto opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6">
                  <p className="text-sm text-muted">O mapa é carregado do Google somente se você tocar abaixo.</p>
                  <button onClick={() => setShowMap(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-brass/60 bg-ink px-5 text-[14px] font-semibold text-brass-light">
                    <Icon name="route" className="h-[18px] w-[18px]" /> Mostrar mapa
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Contact href={whatsappLink(waMessages.general())} icon="whatsapp" label="WhatsApp" onClick={() => track('whatsapp_click', { from: 'location' })} />
            <Contact href={`tel:${site.contact.phoneHref}`} icon="phone" label="Ligar" onClick={() => track('call_click', { from: 'location' })} />
            <Contact href={`mailto:${site.contact.email}`} icon="mail" label="E-mail" />
            <Contact href={site.contact.instagram} icon="instagram" label="Instagram" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RouteBtn({ href, label, icon }: { href: string; label: string; icon: IconName }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('route_click', { app: label })} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border hairline text-[12px] transition-colors hover:border-brass/60">
      <Icon name={icon} className="h-[18px] w-[18px] text-brass" />
      {label}
    </a>
  );
}

function Contact({ href, icon, label, onClick }: { href: string; icon: IconName; label: string; onClick?: () => void }) {
  const external = href.startsWith('http');
  return (
    <a href={href} onClick={onClick} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border hairline bg-ink text-[13px] font-medium transition-colors hover:border-brass/60" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <Icon name={icon} className="h-[18px] w-[18px] text-brass" />
      {label}
    </a>
  );
}
