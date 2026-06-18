'use client';

import { useState, useTransition } from 'react';
import { submitLocation, type UploadResult } from './actions';
import type { PhysicalLocationInput } from '@/app/api/locations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field';

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const;
type Day = typeof DAYS[number];

type HoursEntry = { day: Day; opens_at: string; closes_at: string; notes: string };

const emptyHours = (): HoursEntry => ({ day: 'monday', opens_at: '', closes_at: '', notes: '' });

const selectClass =
  'h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 transition-[color,box-shadow,background-color]';

export function UploadForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<UploadResult | null>(null);
  const [hours, setHours] = useState<HoursEntry[]>([]);

  const [fields, setFields] = useState({
    resource_id: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    neighborhood: '',
    latitude: '',
    longitude: '',
    phone_number: '',
    verification_status: 'pending',
  });

  const fieldErrors = result?.fieldErrors ?? {};

  const set =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const addHours = () => setHours((h) => [...h, emptyHours()]);
  const removeHours = (i: number) => setHours((h) => h.filter((_, idx) => idx !== i));
  const setHoursField =
    (i: number, key: keyof HoursEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setHours((h) =>
        h.map((entry, idx) => (idx === i ? { ...entry, [key]: e.target.value } : entry))
      );

  const resetForm = () => {
    setFields({
      resource_id: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip_code: '',
      neighborhood: '',
      latitude: '',
      longitude: '',
      phone_number: '',
      verification_status: 'pending',
    });
    setHours([]);
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const payload: PhysicalLocationInput = {
      resource_id: fields.resource_id,
      address: fields.address,
      address2: fields.address2 || undefined,
      city: fields.city,
      state: fields.state,
      zip_code: fields.zip_code,
      neighborhood: fields.neighborhood || undefined,
      latitude: fields.latitude ? parseFloat(fields.latitude) : undefined,
      longitude: fields.longitude ? parseFloat(fields.longitude) : undefined,
      phone_number: fields.phone_number || undefined,
      verification_status:
        (fields.verification_status as PhysicalLocationInput['verification_status']) || undefined,
      resource_hours:
        hours.length > 0
          ? hours.map((h) => ({
              day: h.day,
              opens_at: h.opens_at,
              closes_at: h.closes_at,
              notes: h.notes || undefined,
            }))
          : undefined,
    };

    startTransition(async () => {
      const res = await submitLocation(payload);
      setResult(res);
      if (res.success) {
        setHours([]);
        setFields({
          resource_id: '',
          address: '',
          address2: '',
          city: '',
          state: '',
          zip_code: '',
          neighborhood: '',
          latitude: '',
          longitude: '',
          phone_number: '',
          verification_status: 'pending',
        });
      }
    });
  };

  if (result?.success) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="font-medium text-green-700 dark:text-green-400">Location created successfully!</p>
        <p className="text-sm text-muted-foreground mt-1">
          ID: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{result.locationId}</code>
        </p>
        <Button variant="outline" className="mt-4" onClick={resetForm}>
          Add another location
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {result?.error && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {result.error}
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold mb-2">Location Details</legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resource_id">
            Resource ID <span className="text-destructive" aria-label="required">*</span>
          </Label>
          <Input
            id="resource_id"
            name="resource_id"
            value={fields.resource_id}
            onChange={set('resource_id')}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            required
            aria-invalid={!!fieldErrors.resource_id?.length}
          />
          <FieldError errors={fieldErrors.resource_id?.map((m) => ({ message: m }))} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">
            Address <span className="text-destructive" aria-label="required">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            value={fields.address}
            onChange={set('address')}
            placeholder="123 Main St"
            required
            aria-invalid={!!fieldErrors.address?.length}
          />
          <FieldError errors={fieldErrors.address?.map((m) => ({ message: m }))} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address2">Address Line 2</Label>
          <Input
            id="address2"
            name="address2"
            value={fields.address2}
            onChange={set('address2')}
            placeholder="Suite 100, Floor 2, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">
              City <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              value={fields.city}
              onChange={set('city')}
              placeholder="Portland"
              required
              aria-invalid={!!fieldErrors.city?.length}
            />
            <FieldError errors={fieldErrors.city?.map((m) => ({ message: m }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">
              State <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              value={fields.state}
              onChange={set('state')}
              placeholder="OR"
              required
              aria-invalid={!!fieldErrors.state?.length}
            />
            <FieldError errors={fieldErrors.state?.map((m) => ({ message: m }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zip_code">
              Zip Code <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={fields.zip_code}
              onChange={set('zip_code')}
              placeholder="97201"
              required
              minLength={5}
              maxLength={10}
              aria-invalid={!!fieldErrors.zip_code?.length}
            />
            <FieldError errors={fieldErrors.zip_code?.map((m) => ({ message: m }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              value={fields.neighborhood}
              onChange={set('neighborhood')}
              placeholder="Pearl District"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              value={fields.latitude}
              onChange={set('latitude')}
              placeholder="45.5231"
              aria-invalid={!!fieldErrors.latitude?.length}
            />
            <FieldError errors={fieldErrors.latitude?.map((m) => ({ message: m }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              value={fields.longitude}
              onChange={set('longitude')}
              placeholder="-122.6765"
              aria-invalid={!!fieldErrors.longitude?.length}
            />
            <FieldError errors={fieldErrors.longitude?.map((m) => ({ message: m }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={fields.phone_number}
              onChange={set('phone_number')}
              placeholder="(503) 555-0100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verification_status">Verification Status</Label>
            <select
              id="verification_status"
              name="verification_status"
              value={fields.verification_status}
              onChange={set('verification_status')}
              className={selectClass}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <legend className="text-base font-semibold">Resource Hours</legend>
          <Button type="button" variant="outline" size="sm" onClick={addHours}>
            + Add Hours
          </Button>
        </div>

        {hours.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hours added yet. Click &ldquo;Add Hours&rdquo; to specify operating hours.
          </p>
        )}

        {hours.map((entry, i) => (
          <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Entry {i + 1}</span>
              <button
                type="button"
                onClick={() => removeHours(i)}
                className="text-sm text-destructive hover:underline underline-offset-4"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`day-${i}`}>Day</Label>
                <select
                  id={`day-${i}`}
                  value={entry.day}
                  onChange={setHoursField(i, 'day')}
                  className={selectClass}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`opens-${i}`}>
                  Opens At <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input
                  id={`opens-${i}`}
                  type="time"
                  value={entry.opens_at}
                  onChange={setHoursField(i, 'opens_at')}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`closes-${i}`}>
                  Closes At <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input
                  id={`closes-${i}`}
                  type="time"
                  value={entry.closes_at}
                  onChange={setHoursField(i, 'closes_at')}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`notes-${i}`}>Notes</Label>
              <Input
                id={`notes-${i}`}
                value={entry.notes}
                onChange={setHoursField(i, 'notes')}
                placeholder="e.g. Closed on holidays"
              />
            </div>
          </div>
        ))}

        {fieldErrors.resource_hours && (
          <FieldError errors={fieldErrors.resource_hours.map((m) => ({ message: m }))} />
        )}
      </fieldset>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Uploading…' : 'Create Location'}
      </Button>
    </form>
  );
}
