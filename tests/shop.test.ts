import { describe, expect, it } from 'vitest';
import media from '@/data/media.json';
import { productById, products } from '@/config/products';
import { waMessages } from '@/lib/whatsapp';
import { useCart } from '@/shop/cart';

describe('product catalog', () => {
  it('has unique ids and a photo in the media manifest for every product', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const p of products) expect(media, p.id).toHaveProperty(p.image);
  });
  it('kits only reference existing products and cost less than their parts', () => {
    for (const kit of products.filter((p) => p.includes)) {
      const parts = kit.includes!.map((id) => productById(id));
      expect(parts.every(Boolean), kit.id).toBe(true);
      expect(kit.priceCents, kit.id).toBeLessThan(parts.reduce((n, p) => n + p!.priceCents, 0));
    }
  });
});

describe('order message', () => {
  it('lists items with quantities and the total', () => {
    const msg = waMessages.order([{ name: 'Óleo para Barba', qty: 2, priceCents: 5900 }], 11800);
    expect(msg).toContain('2x Óleo para Barba');
    expect(msg).toContain('Total');
    expect(msg).toContain('retirar');
  });
});

describe('cart module', () => {
  it('exports the hook used by the shop UI', () => {
    expect(typeof useCart).toBe('function');
  });
});
