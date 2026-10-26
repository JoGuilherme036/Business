import { Link } from 'react-router-dom';
import { fullAddress, site } from '@/config/site';
import { formatRanges } from '@/lib/hours';
import { weekdayNames } from '@/lib/time';
import { useMotionPref } from '@/hooks/useMotionPref';
import { Monogram } from '../ui/Monogram';
import { Icon } from '../ui/Icon';

export function Footer() {
  const { reduced, setPref } = useMotionPref();
  const order = [1, 2, 3, 4, 5, 6, 0] as const;
  return (
    <footer className="relative z-10 border-t hairline bg-ink pb-28 pt-16 md:pb-12">
      <div className="container-x grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Monogram className="h-12 w-12" />
            <p className="font-display text-2xl italic">{site.name}</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{fullAddress}</p>
          <div className="mt-6 flex gap-2">
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-brass/60">
              <Icon name="instagram" />
            </a>
            <a href={`mailto:${site.contact.email}`} aria-label="E-mail" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-brass/60">
              <Icon name="mail" />
            </a>
            <a href={`tel:${site.contact.phoneHref}`} aria-label="Telefone" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-brass/60">
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
            <li><Link className="hover:text-brass-light" to="/agendar">Agendar horário</Link></li>
            <li><Link className="hover:text-brass-light" to="/meu-agendamento">Meu agendamento</Link></li>
            <li><Link className="hover:text-brass-light" to="/privacidade">Privacidade</Link></li>
            <li><Link className="hover:text-brass-light" to="/admin">Área da barbearia</Link></li>
            <li>
              <button className="text-left hover:text-brass-light" onClick={() => setPref(reduced ? 'full' : 'reduced')} aria-pressed={reduced}>
                {reduced ? 'Ativar animações' : 'Reduzir animações'}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-14 flex flex-col gap-2 border-t hairline pt-6 text-[12px] text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
        {site.demo && <p className="text-brass/80">Versão de demonstração: dados comerciais fictícios.</p>}
      </div>
    </footer>
  );
}
