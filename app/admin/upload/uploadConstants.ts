export const BENEFIT_CATEGORIES = [
  { value: 'free_food', label: 'Free Food' },
  { value: 'discounted_food', label: 'Discounted Food' },
  { value: 'snap_accepted', label: 'SNAP Accepted' },
  { value: 'student_discount', label: 'Student Discount' },
  { value: 'senior_discount', label: 'Senior Discount' },
  { value: 'kids_eat_free', label: 'Kids Eat Free' },
  { value: 'bogo', label: 'BOGO' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'free_breakfast', label: 'Free Breakfast' },
  { value: 'other', label: 'Other' },
] as const;

export const VALID_BENEFITS = new Set(BENEFIT_CATEGORIES.map((b) => b.value));

export const selectClass =
  'h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 transition-[color,box-shadow,background-color]';
