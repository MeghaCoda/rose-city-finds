'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadOffers, type CSVOfferRow, type BatchUploadResult } from './actions';
import { BENEFIT_CATEGORIES, selectClass } from './uploadConstants';

type SingleEntryState = {
  name: string;
  description: string;
  offer_desc: string;
  offer_source: string;
  benefits: string[];
  expires_at: string;
  is_active: string;
  notes: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  phone_number: string;
  location_notes: string;
};

const emptyState: SingleEntryState = {
  name: '',
  description: '',
  offer_desc: '',
  offer_source: '',
  benefits: [],
  expires_at: '',
  is_active: '',
  notes: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  zip_code: '',
  neighborhood: '',
  phone_number: '',
  location_notes: '',
};

function validate(s: SingleEntryState): string[] {
  const errors: string[] = [];
  if (!s.name.trim()) errors.push('Name is required.');

  const hasAnyLocation = !!(
    s.address || s.address2 || s.city || s.state ||
    s.zip_code || s.neighborhood || s.phone_number || s.location_notes
  );
  if (hasAnyLocation) {
    if (!s.address.trim()) errors.push('Address is required when adding a location.');
    if (!s.city.trim()) errors.push('City is required when adding a location.');
    if (!s.state.trim()) errors.push('State is required when adding a location.');
    if (!s.zip_code.trim()) errors.push('Zip code is required when adding a location.');
  }

  return errors;
}

function toOfferRow(s: SingleEntryState): CSVOfferRow {
  const hasAnyLocation = !!(
    s.address || s.address2 || s.city || s.state ||
    s.zip_code || s.neighborhood || s.phone_number || s.location_notes
  );
  return {
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    offer_desc: s.offer_desc.trim() || undefined,
    offer_source: s.offer_source.trim() || undefined,
    benefits: s.benefits.length > 0 ? s.benefits : undefined,
    expires_at: s.expires_at || undefined,
    is_active: s.is_active === 'true' ? true : s.is_active === 'false' ? false : undefined,
    notes: s.notes.trim() || undefined,
    location: hasAnyLocation
      ? {
          address: s.address.trim(),
          address2: s.address2.trim() || undefined,
          city: s.city.trim(),
          state: s.state.trim(),
          zip_code: s.zip_code.trim(),
          neighborhood: s.neighborhood.trim() || undefined,
          phone_number: s.phone_number.trim() || undefined,
          notes: s.location_notes.trim() || undefined,
        }
      : undefined,
  };
}

export function SingleEntrySection({ adminUserId }: { adminUserId: string }) {
  const [form, setForm] = useState<SingleEntryState>(emptyState);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitResult, setSubmitResult] = useState<BatchUploadResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const set =
    (key: keyof SingleEntryState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const toggleBenefit = (value: string) =>
    setForm((s) => ({
      ...s,
      benefits: s.benefits.includes(value)
        ? s.benefits.filter((b) => b !== value)
        : [...s.benefits, value],
    }));

  const handleSubmit = () => {
    const errors = validate(form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSubmitResult(null);
      return;
    }
    setValidationErrors([]);
    setSubmitResult(null);
    startTransition(async () => {
      const res = await uploadOffers([toOfferRow(form)], adminUserId);
      setSubmitResult(res);
      if (res.success) setForm(emptyState);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {submitResult?.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Offer created successfully.
        </div>
      )}
      {submitResult?.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {submitResult.error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive">Please fix the following:</p>
          <ul className="text-sm text-destructive list-disc list-inside space-y-1">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold mb-2">Offer Details</legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-name">
            Name <span className="text-destructive" aria-label="required">*</span>
          </Label>
          <Input id="single-name" value={form.name} onChange={set('name')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-description">Description</Label>
          <Input id="single-description" value={form.description} onChange={set('description')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-offer-desc">Offer Description</Label>
          <Input id="single-offer-desc" value={form.offer_desc} onChange={set('offer_desc')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-offer-source">Offer Source</Label>
          <Input id="single-offer-source" value={form.offer_source} onChange={set('offer_source')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Benefits</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {BENEFIT_CATEGORIES.map((b) => (
              <label key={b.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.benefits.includes(b.value)}
                  onChange={() => toggleBenefit(b.value)}
                />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-expires-at">Expires At</Label>
            <Input id="single-expires-at" type="date" value={form.expires_at} onChange={set('expires_at')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-is-active">Active Status</Label>
            <select id="single-is-active" value={form.is_active} onChange={set('is_active')} className={selectClass}>
              <option value="">Not set</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-notes">Notes</Label>
          <Input id="single-notes" value={form.notes} onChange={set('notes')} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold mb-2">
          Location <span className="text-sm font-normal text-muted-foreground">(optional)</span>
        </legend>
        <p className="text-sm text-muted-foreground -mt-2">
          If any location field is filled, address, city, state, and zip code are all required.
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-address">Address</Label>
          <Input id="single-address" value={form.address} onChange={set('address')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-address2">Address 2</Label>
          <Input id="single-address2" value={form.address2} onChange={set('address2')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-city">City</Label>
            <Input id="single-city" value={form.city} onChange={set('city')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-state">State</Label>
            <Input id="single-state" value={form.state} onChange={set('state')} placeholder="OR" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-zip">Zip Code</Label>
            <Input id="single-zip" value={form.zip_code} onChange={set('zip_code')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-neighborhood">Neighborhood</Label>
            <Input id="single-neighborhood" value={form.neighborhood} onChange={set('neighborhood')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-phone">Phone Number</Label>
            <Input id="single-phone" value={form.phone_number} onChange={set('phone_number')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-location-notes">Location Notes</Label>
          <Input id="single-location-notes" value={form.location_notes} onChange={set('location_notes')} />
        </div>
      </fieldset>

      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Submitting…' : 'Submit'}
      </Button>
    </div>
  );
}
