export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type Booking = {
  code: string;
  status: BookingStatus;
  day: string; // YYYY-MM-DD, shop local
  time: string; // HH:mm, shop local
  start: string; // ISO instant
  end: string; // ISO instant
  proId: string;
  serviceIds: string[];
  durationMin: number;
  totalCents: number;
  customer: { name: string; phone: string; email?: string; notes?: string };
  createdAt: string;
};

export type CreateBookingRequest = {
  idempotencyKey: string;
  serviceIds: string[];
  proId: string | 'any';
  day: string;
  time: string;
  customer: { name: string; phone: string; email?: string; notes?: string };
};

/** A blocked period set by the shop: a time range or a whole day, for one professional or everyone. */
export type Block = {
  id: number;
  proId: string | null; // null = whole shop
  day: string;
  startTime: string | null; // null = whole day
  endTime: string | null;
  reason: string | null;
};

export type NewBlock = {
  proId: string | null;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD, inclusive
  startTime?: string; // omitted = whole day
  endTime?: string;
  reason?: string;
};

export type BusyMap = Record<string, { start: number; end: number }[]>;
export type DayClosures = { closed: string[]; off: Record<string, string[]> };

export type BookingErrorCode = 'slot_taken' | 'invalid' | 'not_found' | 'too_late' | 'network' | 'unauthorized';

export class BookingError extends Error {
  constructor(public code: BookingErrorCode, message?: string) {
    super(message ?? code);
  }
}

export interface BookingApi {
  mode: 'demo' | 'live';
  /** Changes every time a booking or block changes anywhere; cheap to poll. */
  version(): Promise<number>;
  /** Busy intervals per professional for one day (bookings + blocks). Never returns customer data. */
  getBusy(day: string): Promise<BusyMap>;
  /** Whole-day closures between two days, inclusive. */
  closures(from: string, to: string): Promise<DayClosures>;
  create(req: CreateBookingRequest): Promise<Booking>;
  find(code: string, phone: string): Promise<Booking | null>;
  cancel(code: string, phone: string): Promise<Booking>;
}

export interface AdminApi {
  /** Checks the password; throws BookingError('unauthorized') when wrong. */
  login(password: string): Promise<void>;
  day(day: string): Promise<{ bookings: Booking[]; blocks: Block[] }>;
  addBlock(block: NewBlock): Promise<{ created: number; conflicts: Booking[] }>;
  removeBlock(id: number): Promise<void>;
  setStatus(code: string, status: Exclude<BookingStatus, 'confirmed'>): Promise<Booking>;
  /** Book on behalf of a client (phone or walk-in): no minimum notice, phone optional. */
  book(req: CreateBookingRequest): Promise<Booking>;
}
