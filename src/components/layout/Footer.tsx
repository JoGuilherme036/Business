import { Link } from 'react-router-dom';
import { fullAddress, site } from '@/config/site';
import { formatRanges } from '@/lib/hours';
import { weekdayNames } from '@/lib/time';
import { useMotionPref } from '@/hooks/useMotionPref';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

export function Footer() {
  const { reduced, setPref } = useMotionPref();
  const order = [1, 2, 3, 4, 5, 6, 0] as const;
  return (
    <footer className="relative z-10 bg-ink pb-28 md:pb-12">
      <div className="pole mb-16" aria-hidden="true" />
      <div className="container-x grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size="lg" />
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory/55">{site.concept}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{fullAddress}</p>
          <div className="mt-6 flex gap-2">
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-accent/60">
              <Icon name="instagram" />
            </a>
            <a href={`mailto:${site.contact.email}`} aria-label="E-mail" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-accent/60">
              <Icon name="mail" />
            </a>
            <a href={`tel:${site.contact.phoneHref}`} aria-label="Telefone" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-accent/60">
              <Icon name="phone" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Horários</p>
          <dl className="mt-4 space-y-1.5 text-sm">
            {order.map((d) => (
              <div key={d} className="flex justify-between gap-4">
                <dt className="text-muted">{weekdayNames[d]}</dt>
                <dd className="tabular-nums">{formatRanges(site.hours[d])}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="eyebrow">Atalhos</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="hover:text-accent-light" to="/agendar">Agendar horário</Link></li>
            <li><Link className="hover:text-accent-light" to="/meu-agendamento">Meu agendamento</Link></li>
            <li><Link className="hover:text-accent-light" to="/privacidade">Privacidade</Link></li>
            <li><Link className="hover:text-accent-light" to="/admin">Área da barbearia</Link></li>
            <li>
              <button className="text-left hover:text-accent-light" onClick={() => setPref(reduced ? 'full' : 'reduced')} aria-pressed={reduced}>
                {reduced ? 'Ativar animações' : 'Reduzir animações'}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-14 flex flex-col gap-2 border-t hairline pt-6 text-[12px] text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
        {site.demo && <p className="text-accent/80">Versão de demonstração: dados comerciais fictícios.</p>}
      </div>
    </footer>
  );
}
