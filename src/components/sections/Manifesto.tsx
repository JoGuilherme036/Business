import { Reveal, ScrollWords } from '../ui/Reveal';
import { Icon, type IconName } from '../ui/Icon';

const principles: { icon: IconName; title: string; text: string }[] = [
  { icon: 'clock', title: 'Hora marcada', text: 'Sem fila e sem correria. Seu horário é só seu.' },
  { icon: 'scissors', title: 'Técnica apurada', text: 'Consulta de imagem, tesoura, máquina e navalha em todo atendimento.' },
  { icon: 'sparkle', title: 'Cortesia da casa', text: 'Café, bebidas geladas e um ambiente pensado para você desacelerar.' },
];

export function Manifesto() {
  return (
    <section aria-label="Manifesto" className="theme-light relative z-10 py-24 md:py-32">
      <div className="container-x relative">
        <ScrollWords
          className="display max-w-5xl text-[clamp(1.9rem,6.6vw,4.4rem)] leading-[1.08]"
          text="Não cortamos apenas cabelo. Construímos a imagem de quem entra aqui: técnica, ambiente exclusivo e o tempo que o seu resultado pede."
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border hairline bg-ivory/10 sm:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="bg-ink/95 p-6 md:p-8">
              <Icon name={p.icon} className="h-6 w-6 text-accent" />
              <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
