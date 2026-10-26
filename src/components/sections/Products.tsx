import { useNavigate } from 'react-router-dom';
import { products } from '@/config/products';
import { ProductCard } from '@/shop/ProductCard';
import { SectionHeading } from '../ui/SectionHeading';
import { LinkButton } from '../ui/Button';
import { Reveal } from '../ui/Reveal';

/** Home teaser of the product catalog: featured items in a snap carousel, then the full catalog page. */
export function ProductsShowcase() {
  const navigate = useNavigate();
  const featured = products.filter((p) => p.featured);
  return (
    <section id="produtos" aria-labelledby="produtos-title" className="relative z-10 scroll-mt-20 overflow-hidden bg-ink py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.10),transparent)]" />
      <div className="container-x flex flex-col justify-between gap-8 md:flex-row md:items-end" id="produtos-title">
        <SectionHeading chapter="V" label="Produtos" lines={['A linha', <em key="e" className="accent-text">Business.</em>]} intro="Os produtos que usamos na cadeira, para manter o resultado em casa. Reserve pelo WhatsApp e retire na barbearia." />
        <Reveal className="hidden md:block">
          <LinkButton to="/produtos" variant="ghost" iconRight="arrowRight">Ver catálogo completo</LinkButton>
        </Reveal>
      </div>

      <div className="no-scrollbar container-x mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:gap-6">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06} className="w-[62%] max-w-[17rem] shrink-0 snap-start md:w-[calc(25%-1.125rem)] md:max-w-none">
            <ProductCard product={p} onOpen={(x) => navigate(`/produtos?produto=${x.id}`)} className="h-full" sizes="(min-width: 768px) 22vw, 62vw" />
          </Reveal>
        ))}
      </div>

      <div className="container-x mt-8 md:hidden">
        <LinkButton to="/produtos" variant="ghost" iconRight="arrowRight" className="w-full">Ver catálogo completo</LinkButton>
      </div>
    </section>
  );
}
