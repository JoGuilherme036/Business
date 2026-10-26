// Privacy-first event hook. Never pass personal data (name, phone, booking code) here.
type EventName =
  | 'cta_book_click'
  | 'whatsapp_click'
  | 'call_click'
  | 'route_click'
  | 'booking_step_view'
  | 'booking_confirmed';

export function track(event: EventName, props: Record<string, string | number> = {}) {
  const w = window as unknown as { dataLayer?: unknown[]; plausible?: (e: string, o: unknown) => void };
  w.plausible?.(event, { props });
  w.dataLayer?.push({ event, ...props });
}
