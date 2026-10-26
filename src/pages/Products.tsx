import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productById, productCategories, products, type Product, type ProductCategory } from '@/config/products';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductCard } from '@/shop/ProductCard';
import { ProductDialog } from '@/shop/ProductDialog';
import { useCart } from '@/shop/cart';
import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import { MaskLines, Reveal } from '@/components/ui/Reveal';

type Sort = 'destaques' | 'menor' | 'maior';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Products() {
  useDocumentTitle('Produtos');
  const [params, setParams] = useSearchParams();
  const { count, setOpen } = useCart();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('destaques');

  const category = (productCategories.some((c) => c.id === params.get('categoria')) ? params.get('categoria') : 'todos') as ProductCategory | 'todos';
  const selected = productById(params.get('produto') ?? '') ?? null;

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );
  const openProduct = useCallback((p: Product) => update({ produto: p.id }), [update]);
  const closeProduct = useCallback(() => update({ produto: null }), [update]);

  const list = useMemo(() => {
    const q = norm(query.trim());
    const filtered = products.filter((p) => (category === 'todos' || p.category === category) && (!q || norm(`${p.name} ${p.tagline} ${p.description}`).includes(q)));
    if (sort === 'menor') return [...filtered].sort((a, b) => a.priceCents - b.priceCents);
    if (sort === 'maior') return [...filtered].sort((a, b) => b.priceCents - a.priceCents);
    return filtered;
  }, [category, query, sort]);

  return (
    <main id="conteudo" className="relative bg-ink pb-24 pt-28 md:pt-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_70%_at_50%_0%,rgb(var(--accent)/0.12),transparent)]" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" /> Linha Business
          </p>
        </Reveal>
        <MaskLines as="h1" lines={['Produtos para', <em key="e" className="accent-text">manter a imagem.</em>]} className="display mt-5 text-[clamp(2.3rem,8.5vw,5.6rem)]" />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            Os mesmos produtos que usamos na cadeira. Monte sua sacola, reserve pelo WhatsApp e retire na barbearia, com pagamento no balcão.
          </p>
        </Reveal>
      </div>

      <div className="sticky top-16 z-30 mt-10 border-y hairline bg-ink/95 md:top-20">
        <div className="container-x flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0" role="tablist" aria-label="Categorias">
            {productCategories.map((c) => {
              const on = c.id === category;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => update({ categoria: c.id === 'todos' ? null : c.id })}
                  className={`min-h-11 shrink-0 rounded-[3px] border px-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-colors ${on ? 'border-ivory bg-ivory text-ink' : 'border-ivory/15 text-ivory/80 hover:border-ivory/40'}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 md:w-56 md:flex-none">
              <span className="sr-only">Buscar produto</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar"
                type="search"
                className="h-11 w-full rounded-[3px] border border-ivory/15 bg-transparent pl-9 pr-3 text-[14px] placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </label>
            <label>
              <span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-[3px] border border-ivory/15 bg-ink px-3 text-[13px] focus:border-accent focus:outline-none">
                <option value="destaques">Destaques</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="container-x mt-10">
        <p className="mb-5 text-[12px] uppercase tracking-[0.18em] text-muted" aria-live="polite">
          {list.length} {list.length === 1 ? 'produto' : 'produtos'}
        </p>
        {list.length ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06} className="h-full">
                <ProductCard product={p} onOpen={openProduct} className="h-full" sizes="(min-width: 1024px) 25vw, 50vw" />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="grid place-items-center rounded-lg glass py-20 text-center">
            <p className="display text-2xl">Nenhum produto encontrado</p>
            <button onClick={() => (setQuery(''), update({ categoria: null }))} className="mt-4 min-h-11 text-sm text-accent-light underline underline-offset-4">
              Limpar filtros
            </button>
          </div>
        )}

        <Reveal className="mt-16">
          <div className="grid gap-6 rounded-lg glass p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="eyebrow">Experimente na cadeira</p>
              <p className="display mt-3 max-w-xl text-2xl md:text-3xl">Prefere conhecer antes de levar? Agende e peça para testar durante o atendimento.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton to="/agendar" iconRight="arrowRight">Agendar horário</LinkButton>
              <button onClick={() => setOpen(true)} className="inline-flex min-h-12 items-center gap-2 rounded-[3px] border border-ivory/25 px-5 text-[12px] font-semibold uppercase tracking-[0.14em] hover:border-accent">
                <Icon name="bag" className="h-4 w-4" /> Sacola{count ? ` (${count})` : ''}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <ProductDialog product={selected} onClose={closeProduct} onOpenProduct={openProduct} />
    </main>
  );
}
