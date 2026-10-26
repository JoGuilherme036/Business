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

export type BookingErrorCode = 'slot_taken' | 'invalid' | 'not_found' | 'too_late' | 'network' | 'unauthorized' | 'forbidden' | 'locked' | 'username_taken' | 'weak_password' | 'setup_done';

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

export type StaffRole = 'admin' | 'barbeiro';
export type StaffUser = { id: number; username: string; name: string; role: StaffRole; proId: string | null; active: boolean; lastLoginAt?: string | null };
export type NewStaffUser = { username: string; name: string; password: string; role: StaffRole; proId: string | null };
export type StaffPatch = Partial<{ name: string; role: StaffRole; proId: string | null; active: boolean; password: string }>;

export interface AdminApi {
  /** True while no staff account exists: the first admin is created with the setup key. */
  setupNeeded(): Promise<boolean>;
  setup(req: { setupKey: string; username: string; name: string; password: string }): Promise<StaffUser>;
  /** Throws BookingError('unauthorized') for a wrong user/password and ('locked') after too many attempts. */
  login(username: string, password: string, remember: boolean): Promise<StaffUser>;
  /** The signed-in account; throws BookingError('unauthorized') when there is no valid session. */
  me(): Promise<StaffUser>;
  logout(): Promise<void>;
  changePassword(current: string, next: string): Promise<void>;
  /** Admin only. */
  users(): Promise<StaffUser[]>;
  createUser(user: NewStaffUser): Promise<StaffUser>;
  updateUser(id: number, patch: StaffPatch): Promise<StaffUser>;
  day(day: string): Promise<{ bookings: Booking[]; blocks: Block[] }>;
  addBlock(block: NewBlock): Promise<{ created: number; conflicts: Booking[] }>;
  removeBlock(id: number): Promise<void>;
  setStatus(code: string, status: Exclude<BookingStatus, 'confirmed'>): Promise<Booking>;
  /** Book on behalf of a client (phone or walk-in): no minimum notice, phone optional. */
  book(req: CreateBookingRequest): Promise<Booking>;
}
