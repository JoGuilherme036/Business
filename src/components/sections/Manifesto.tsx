import { Reveal, ScrollWords } from '../ui/Reveal';
import { Icon, type IconName } from '../ui/Icon';

const principles: { icon: IconName; title: string; text: string }[] = [
  { icon: 'clock', title: 'Hora marcada', text: 'Sem fila e sem correria. Seu horário é só seu.' },
  { icon: 'scissors', title: 'Ofício à mão', text: 'Tesoura, navalha e toalha quente em todo atendimento.' },
  { icon: 'sparkle', title: 'Pausa de verdade', text: 'Café, uma dose ou água com gás enquanto você espera o espelho.' },
];

export function Manifesto() {
  return (
    <section aria-label="Manifesto" className="relative z-10 pb-24 pt-8 md:pb-32">
      <div className="container-x relative">
        <ScrollWords
          className="display max-w-5xl text-[clamp(1.9rem,6.6vw,4.4rem)] leading-[1.08]"
          text="Não somos uma barbearia de passagem. Somos um ateliê: ferramentas afiadas, luz baixa e o tempo que o seu corte pede."
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border hairline bg-brass/10 sm:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="bg-ink/95 p-6 md:p-8">
              <Icon name={p.icon} className="h-6 w-6 text-brass" />
              <h3 className="mt-5 font-display text-2xl italic">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
