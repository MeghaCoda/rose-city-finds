'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BusinessCombobox } from './BusinessCombobox';
import {
  submitOfferEntry,
  getBusinessDetail,
  type BusinessOption,
  type BusinessDetail,
  type BusinessLocationOption,
  type OfferEntryInput,
  type OfferEntryResult,
} from './actions';
import {
  PRICE_TYPES,
  ELIGIBILITY_TYPES,
  VENUE_TYPES,
  DEFAULT_VENUE_TYPE,
  DAYS_OF_WEEK,
  selectClass,
  LOADING_LABEL,
  BUSINESS_STEP_LEGEND,
  CHANGE_BUSINESS_LABEL,
  DESCRIPTION_LABEL,
  VENUE_TYPE_LABEL,
  NOTES_LABEL,
  LOCATION_STEP_LEGEND,
  ADD_NEW_LOCATION_LABEL,
  NO_LOCATION_LABEL,
  ADDRESS_LABEL,
  ADDRESS2_LABEL,
  CITY_LABEL,
  STATE_LABEL,
  ZIP_CODE_LABEL,
  NEIGHBORHOOD_LABEL,
  PHONE_LABEL,
  LOCATION_NOTES_LABEL,
  HOURS_LEGEND,
  HOURS_NOTES_LABEL,
  ADD_HOURS_LABEL,
  REMOVE_LABEL,
  SELECT_DAY_PLACEHOLDER,
  OPENS_AT_LABEL,
  CLOSES_AT_LABEL,
  OFFER_STEP_LEGEND,
  ADD_NEW_OFFER_LABEL,
  OFFER_NAME_LABEL,
  OFFER_DESC_LABEL,
  OFFER_SOURCE_LABEL,
  PRICE_TYPE_LABEL,
  ELIGIBILITY_LABEL,
  EXPIRES_AT_LABEL,
  ACTIVE_STATUS_LABEL,
  STATUS_NOT_SET,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  SUBMITTING_LABEL,
  SUBMIT_LABEL,
  OFFER_CREATED_SUCCESS,
  VALIDATION_BUSINESS_REQUIRED,
  VALIDATION_NAME_REQUIRED,
  VALIDATION_LOCATION_CHOICE_REQUIRED,
  VALIDATION_ADDRESS_REQUIRED,
  VALIDATION_CITY_REQUIRED,
  VALIDATION_STATE_REQUIRED,
  VALIDATION_ZIP_REQUIRED,
  VALIDATION_OFFER_CHOICE_REQUIRED,
  VALIDATION_OFFER_NAME_REQUIRED,
  VALIDATION_OFFER_NEEDS_LOCATION,
  VALIDATION_ERRORS_HEADER,
} from './uploadConstants';

type HourEntry = { day: string; opens_at: string; closes_at: string };

type NewBusinessFieldKey = 'name' | 'description' | 'venue_type' | 'notes';
type NewLocationFieldKey =
  | 'address' | 'address2' | 'city' | 'state' | 'zip_code'
  | 'neighborhood' | 'phone_number' | 'notes' | 'hours_notes';
type NewOfferFieldKey = 'name' | 'description' | 'offer_source' | 'expires_at' | 'is_active' | 'notes';

type BusinessState =
  | { mode: 'unset' }
  | { mode: 'existing'; id: string; name: string }
  | { mode: 'new'; name: string; description: string; venue_type: string; notes: string };

type LocationState =
  | { mode: 'unset' }
  | { mode: 'existing'; id: string; label: string }
  | {
      mode: 'new';
      address: string;
      address2: string;
      city: string;
      state: string;
      zip_code: string;
      neighborhood: string;
      phone_number: string;
      notes: string;
      hours_notes: string;
      hours: HourEntry[];
    }
  | { mode: 'none' };

type OfferState =
  | { mode: 'unset' }
  | { mode: 'existing'; id: string; name: string }
  | {
      mode: 'new';
      name: string;
      description: string;
      offer_source: string;
      price_type: string[];
      eligibility: string[];
      expires_at: string;
      is_active: string;
      notes: string;
    };

const emptyBusiness: BusinessState = { mode: 'unset' };
const emptyLocation: LocationState = { mode: 'unset' };
const emptyOffer: OfferState = { mode: 'unset' };

function newBusinessDefaults(name: string): BusinessState {
  return { mode: 'new', name, description: '', venue_type: DEFAULT_VENUE_TYPE, notes: '' };
}

function newLocationDefaults(): LocationState {
  return {
    mode: 'new',
    address: '', address2: '', city: '', state: '', zip_code: '',
    neighborhood: '', phone_number: '', notes: '', hours_notes: '', hours: [],
  };
}

function newOfferDefaults(): OfferState {
  return {
    mode: 'new',
    name: '', description: '', offer_source: '', price_type: [],
    eligibility: [], expires_at: '', is_active: '', notes: '',
  };
}

function formatLocationLabel(loc: BusinessLocationOption): string {
  const line1 = loc.address2 ? `${loc.address}, ${loc.address2}` : loc.address;
  return `${line1}, ${loc.city}, ${loc.state} ${loc.zip_code}`;
}

function validate(business: BusinessState, location: LocationState, offer: OfferState): string[] {
  const errors: string[] = [];

  if (business.mode === 'unset') errors.push(VALIDATION_BUSINESS_REQUIRED);
  if (business.mode === 'new' && !business.name.trim()) errors.push(VALIDATION_NAME_REQUIRED);

  if (location.mode === 'unset') errors.push(VALIDATION_LOCATION_CHOICE_REQUIRED);
  if (location.mode === 'new') {
    if (!location.address.trim()) errors.push(VALIDATION_ADDRESS_REQUIRED);
    if (!location.city.trim()) errors.push(VALIDATION_CITY_REQUIRED);
    if (!location.state.trim()) errors.push(VALIDATION_STATE_REQUIRED);
    if (!location.zip_code.trim()) errors.push(VALIDATION_ZIP_REQUIRED);
    location.hours.forEach((h, i) => {
      const n = i + 1;
      if (!h.day) errors.push(`Hours row ${n}: day is required.`);
      if (!h.opens_at) errors.push(`Hours row ${n}: opening time is required.`);
      if (!h.closes_at) errors.push(`Hours row ${n}: closing time is required.`);
    });
  }

  if (offer.mode === 'unset') errors.push(VALIDATION_OFFER_CHOICE_REQUIRED);
  if (offer.mode === 'new' && !offer.name.trim()) errors.push(VALIDATION_OFFER_NAME_REQUIRED);
  if (offer.mode === 'existing' && location.mode === 'none') errors.push(VALIDATION_OFFER_NEEDS_LOCATION);

  return errors;
}

function toEntryInput(
  business: BusinessState,
  location: LocationState,
  offer: OfferState
): OfferEntryInput | null {
  if (business.mode === 'unset' || location.mode === 'unset' || offer.mode === 'unset') return null;

  const businessInput: OfferEntryInput['business'] =
    business.mode === 'existing'
      ? { mode: 'existing', id: business.id }
      : {
          mode: 'new',
          name: business.name.trim(),
          description: business.description.trim() || undefined,
          venue_type: business.venue_type || DEFAULT_VENUE_TYPE,
          notes: business.notes.trim() || undefined,
        };

  const locationInput: OfferEntryInput['location'] =
    location.mode === 'existing'
      ? { mode: 'existing', id: location.id }
      : location.mode === 'none'
      ? { mode: 'none' }
      : {
          mode: 'new',
          address: location.address.trim(),
          address2: location.address2.trim() || undefined,
          city: location.city.trim(),
          state: location.state.trim(),
          zip_code: location.zip_code.trim(),
          neighborhood: location.neighborhood.trim() || undefined,
          phone_number: location.phone_number.trim() || undefined,
          notes: location.notes.trim() || undefined,
          hours_notes: location.hours_notes.trim() || undefined,
          hours:
            location.hours.length > 0
              ? location.hours.map((h) => ({
                  day: h.day,
                  opens_at: h.opens_at,
                  closes_at: h.closes_at,
                }))
              : undefined,
        };

  const offerInput: OfferEntryInput['offer'] =
    offer.mode === 'existing'
      ? { mode: 'existing', id: offer.id }
      : {
          mode: 'new',
          name: offer.name.trim(),
          description: offer.description.trim() || undefined,
          offer_source: offer.offer_source.trim() || undefined,
          price_type: offer.price_type,
          eligibility: offer.eligibility,
          expires_at: offer.expires_at || undefined,
          is_active: offer.is_active === 'true' ? true : offer.is_active === 'false' ? false : undefined,
          notes: offer.notes.trim() || undefined,
        };

  return { business: businessInput, location: locationInput, offer: offerInput };
}

export function OfferEntryForm({ adminUserId }: { adminUserId: string }) {
  const [resetKey, setResetKey] = useState(0);
  const [business, setBusiness] = useState<BusinessState>(emptyBusiness);
  const [location, setLocation] = useState<LocationState>(emptyLocation);
  const [offer, setOffer] = useState<OfferState>(emptyOffer);
  const [businessDetail, setBusinessDetail] = useState<BusinessDetail | null>(null);
  const [isLoadingDetail, startLoadDetail] = useTransition();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitResult, setSubmitResult] = useState<OfferEntryResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetAll() {
    setResetKey((k) => k + 1);
    setBusiness(emptyBusiness);
    setLocation(emptyLocation);
    setOffer(emptyOffer);
    setBusinessDetail(null);
  }

  function handleSelectExistingBusiness(b: BusinessOption) {
    setBusiness({ mode: 'existing', id: b.id, name: b.name });
    setLocation(emptyLocation);
    setOffer(emptyOffer);
    setBusinessDetail(null);
    startLoadDetail(async () => {
      const detail = await getBusinessDetail(b.id);
      setBusinessDetail(detail);
    });
  }

  function handleCreateNewBusiness(name: string) {
    setBusiness(newBusinessDefaults(name));
    setBusinessDetail(null);
    setLocation(emptyLocation);
    setOffer(emptyOffer);
  }

  function handleLocationChoice(choice: string) {
    if (choice === 'new') setLocation(newLocationDefaults());
    else if (choice === 'none') setLocation({ mode: 'none' });
    else {
      const existing = businessDetail?.locations.find((l) => l.id === choice);
      if (existing) setLocation({ mode: 'existing', id: existing.id, label: formatLocationLabel(existing) });
    }
    setOffer(emptyOffer);
  }

  function handleOfferChoice(choice: string) {
    if (choice === 'new') setOffer(newOfferDefaults());
    else {
      const existing = businessDetail?.offers.find((o) => o.id === choice);
      if (existing) setOffer({ mode: 'existing', id: existing.id, name: existing.name });
    }
  }

  const setBusinessField =
    (key: NewBusinessFieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setBusiness((b) => (b.mode === 'new' ? { ...b, [key]: e.target.value } : b));

  const setLocationField =
    (key: NewLocationFieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setLocation((l) => (l.mode === 'new' ? { ...l, [key]: e.target.value } : l));

  const setOfferField =
    (key: NewOfferFieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setOffer((o) => (o.mode === 'new' ? { ...o, [key]: e.target.value } : o));

  const togglePriceType = (value: string) =>
    setOffer((o) =>
      o.mode === 'new'
        ? {
            ...o,
            price_type: o.price_type.includes(value)
              ? o.price_type.filter((v) => v !== value)
              : [...o.price_type, value],
          }
        : o
    );

  const toggleEligibility = (value: string) =>
    setOffer((o) =>
      o.mode === 'new'
        ? {
            ...o,
            eligibility: o.eligibility.includes(value)
              ? o.eligibility.filter((v) => v !== value)
              : [...o.eligibility, value],
          }
        : o
    );

  const addHour = () =>
    setLocation((l) =>
      l.mode === 'new' ? { ...l, hours: [...l.hours, { day: '', opens_at: '', closes_at: '' }] } : l
    );

  const removeHour = (i: number) =>
    setLocation((l) => (l.mode === 'new' ? { ...l, hours: l.hours.filter((_, idx) => idx !== i) } : l));

  const setHourField =
    (i: number, key: keyof HourEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setLocation((l) =>
        l.mode === 'new'
          ? { ...l, hours: l.hours.map((h, idx) => (idx === i ? { ...h, [key]: e.target.value } : h)) }
          : l
      );

  const handleSubmit = () => {
    const errors = validate(business, location, offer);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSubmitResult(null);
      return;
    }
    const input = toEntryInput(business, location, offer);
    if (!input) return;
    setValidationErrors([]);
    setSubmitResult(null);
    startTransition(async () => {
      const res = await submitOfferEntry(input, adminUserId);
      setSubmitResult(res);
      if (res.success) resetAll();
    });
  };

  const locationRadioValue =
    location.mode === 'unset' ? ''
    : location.mode === 'new' ? 'new'
    : location.mode === 'none' ? 'none'
    : location.id;

  const offerRadioValue =
    offer.mode === 'unset' ? ''
    : offer.mode === 'new' ? 'new'
    : offer.id;

  const canSubmit = business.mode !== 'unset' && location.mode !== 'unset' && offer.mode !== 'unset';

  return (
    <div className="flex flex-col gap-6">
      {submitResult?.success && (
        <div className="rounded-lg border px-4 py-3 text-sm">{OFFER_CREATED_SUCCESS}</div>
      )}
      {submitResult && !submitResult.success && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {submitResult.error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive">{VALIDATION_ERRORS_HEADER}</p>
          <ul className="text-sm text-destructive list-disc list-inside space-y-1">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base font-semibold mb-2">{BUSINESS_STEP_LEGEND}</legend>

        {business.mode === 'unset' && (
          <BusinessCombobox
            key={resetKey}
            value={null}
            onSelectExisting={handleSelectExistingBusiness}
            onCreateNew={handleCreateNewBusiness}
          />
        )}

        {business.mode !== 'unset' && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm">
            <span>{business.mode === 'existing' ? business.name : `${business.name} (new)`}</span>
            <button
              type="button"
              onClick={resetAll}
              className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {CHANGE_BUSINESS_LABEL}
            </button>
          </div>
        )}

        {business.mode === 'new' && (
          <div className="flex flex-col gap-4 mt-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="biz-description">{DESCRIPTION_LABEL}</Label>
              <Input id="biz-description" value={business.description} onChange={setBusinessField('description')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="biz-venue-type">{VENUE_TYPE_LABEL}</Label>
              <select
                id="biz-venue-type"
                value={business.venue_type}
                onChange={setBusinessField('venue_type')}
                className={selectClass}
              >
                {VENUE_TYPES.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="biz-notes">{NOTES_LABEL}</Label>
              <Input id="biz-notes" value={business.notes} onChange={setBusinessField('notes')} />
            </div>
          </div>
        )}
      </fieldset>

      {business.mode !== 'unset' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-semibold mb-2">{LOCATION_STEP_LEGEND}</legend>

          {isLoadingDetail && business.mode === 'existing' && (
            <p className="text-sm text-muted-foreground">{LOADING_LABEL}</p>
          )}

          <RadioGroup value={locationRadioValue} onValueChange={handleLocationChoice}>
            {business.mode === 'existing' &&
              businessDetail?.locations.map((loc) => (
                <RadioGroupItem key={loc.id} value={loc.id} label={formatLocationLabel(loc)} />
              ))}
            <RadioGroupItem value="new" label={ADD_NEW_LOCATION_LABEL} />
            <RadioGroupItem value="none" label={NO_LOCATION_LABEL} />
          </RadioGroup>

          {location.mode === 'new' && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-address">
                  {ADDRESS_LABEL} <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input id="loc-address" value={location.address} onChange={setLocationField('address')} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-address2">{ADDRESS2_LABEL}</Label>
                <Input id="loc-address2" value={location.address2} onChange={setLocationField('address2')} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loc-city">{CITY_LABEL}</Label>
                  <Input id="loc-city" value={location.city} onChange={setLocationField('city')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loc-state">{STATE_LABEL}</Label>
                  <Input id="loc-state" value={location.state} onChange={setLocationField('state')} placeholder="OR" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loc-zip">{ZIP_CODE_LABEL}</Label>
                  <Input id="loc-zip" value={location.zip_code} onChange={setLocationField('zip_code')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loc-neighborhood">{NEIGHBORHOOD_LABEL}</Label>
                  <Input id="loc-neighborhood" value={location.neighborhood} onChange={setLocationField('neighborhood')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loc-phone">{PHONE_LABEL}</Label>
                  <Input id="loc-phone" value={location.phone_number} onChange={setLocationField('phone_number')} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-notes">{LOCATION_NOTES_LABEL}</Label>
                <Input id="loc-notes" value={location.notes} onChange={setLocationField('notes')} />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>{HOURS_LEGEND}</Label>
                  <button
                    type="button"
                    onClick={addHour}
                    className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    {ADD_HOURS_LABEL}
                  </button>
                </div>
                {location.hours.map((h, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`hour-day-${i}`}>Day</Label>
                        <select
                          id={`hour-day-${i}`}
                          value={h.day}
                          onChange={setHourField(i, 'day')}
                          className={selectClass}
                        >
                          <option value="">{SELECT_DAY_PLACEHOLDER}</option>
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`hour-open-${i}`}>{OPENS_AT_LABEL}</Label>
                        <Input id={`hour-open-${i}`} type="time" value={h.opens_at} onChange={setHourField(i, 'opens_at')} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`hour-close-${i}`}>{CLOSES_AT_LABEL}</Label>
                        <Input id={`hour-close-${i}`} type="time" value={h.closes_at} onChange={setHourField(i, 'closes_at')} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeHour(i)}
                        className="h-9 px-3 text-sm text-destructive underline underline-offset-4 hover:text-destructive/80 transition-colors"
                      >
                        {REMOVE_LABEL}
                      </button>
                    </div>
                  </div>
                ))}
                {location.hours.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="loc-hours-notes">{HOURS_NOTES_LABEL}</Label>
                    <Input
                      id="loc-hours-notes"
                      value={location.hours_notes}
                      onChange={setLocationField('hours_notes')}
                      placeholder="e.g. Closed holidays"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </fieldset>
      )}

      {location.mode !== 'unset' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-semibold mb-2">{OFFER_STEP_LEGEND}</legend>

          <RadioGroup value={offerRadioValue} onValueChange={handleOfferChoice}>
            {business.mode === 'existing' &&
              location.mode !== 'none' &&
              businessDetail?.offers.map((o) => (
                <RadioGroupItem key={o.id} value={o.id} label={o.name} />
              ))}
            <RadioGroupItem value="new" label={ADD_NEW_OFFER_LABEL} />
          </RadioGroup>

          {offer.mode === 'new' && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-name">
                  {OFFER_NAME_LABEL} <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input id="offer-name" value={offer.name} onChange={setOfferField('name')} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-desc">{OFFER_DESC_LABEL}</Label>
                <Input id="offer-desc" value={offer.description} onChange={setOfferField('description')} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-source">{OFFER_SOURCE_LABEL}</Label>
                <Input id="offer-source" value={offer.offer_source} onChange={setOfferField('offer_source')} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{PRICE_TYPE_LABEL}</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {PRICE_TYPES.map((p) => (
                    <label key={p.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.price_type.includes(p.value)}
                        onChange={() => togglePriceType(p.value)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{ELIGIBILITY_LABEL}</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {ELIGIBILITY_TYPES.map((el) => (
                    <label key={el.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.eligibility.includes(el.value)}
                        onChange={() => toggleEligibility(el.value)}
                      />
                      {el.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="offer-expires-at">{EXPIRES_AT_LABEL}</Label>
                  <Input id="offer-expires-at" type="date" value={offer.expires_at} onChange={setOfferField('expires_at')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="offer-is-active">{ACTIVE_STATUS_LABEL}</Label>
                  <select
                    id="offer-is-active"
                    value={offer.is_active}
                    onChange={setOfferField('is_active')}
                    className={selectClass}
                  >
                    <option value="">{STATUS_NOT_SET}</option>
                    <option value="true">{STATUS_ACTIVE}</option>
                    <option value="false">{STATUS_INACTIVE}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-notes">{NOTES_LABEL}</Label>
                <Input id="offer-notes" value={offer.notes} onChange={setOfferField('notes')} />
              </div>
            </div>
          )}
        </fieldset>
      )}

      <Button onClick={handleSubmit} disabled={isPending || !canSubmit}>
        {isPending ? SUBMITTING_LABEL : SUBMIT_LABEL}
      </Button>
    </div>
  );
}
