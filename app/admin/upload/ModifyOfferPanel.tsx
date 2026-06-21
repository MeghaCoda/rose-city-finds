'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getOffers,
  getOfferWithLocations,
  updateOffer,
  type OfferSummary,
  type OfferDetail,
  type UpdateOfferResult,
} from './actions';
import { BENEFIT_CATEGORIES, selectClass } from './uploadConstants';

type EditState = {
  name: string;
  description: string;
  offer_desc: string;
  offer_source: string;
  benefits: string[];
  expires_at: string;
  is_active: string;
  verification_status: string;
  notes: string;
};

function offerToEditState(offer: OfferDetail): EditState {
  return {
    name: offer.name,
    description: offer.description ?? '',
    offer_desc: offer.offer_desc ?? '',
    offer_source: offer.offer_source ?? '',
    benefits: offer.benefits ?? [],
    expires_at: offer.expires_at ?? '',
    is_active: offer.is_active == null ? '' : String(offer.is_active),
    verification_status: offer.verification_status ?? '',
    notes: offer.notes ?? '',
  };
}

export function ModifyOfferPanel({ onBack }: { onBack: () => void }) {
  const [offers, setOffers] = useState<OfferSummary[] | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [offerDetail, setOfferDetail] = useState<OfferDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveResult, setSaveResult] = useState<UpdateOfferResult | null>(null);

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoadingOffers(false);
    });
  }, []);

  const handleSelectOffer = (id: string) => {
    setSelectedId(id);
    setSaveResult(null);
    setOfferDetail(null);
    setEditState(null);
    if (!id) return;
    setLoadingDetail(true);
    getOfferWithLocations(id).then((detail) => {
      setLoadingDetail(false);
      if (detail) {
        setOfferDetail(detail);
        setEditState(offerToEditState(detail));
      }
    });
  };

  const set = (key: keyof EditState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditState((s) => s && { ...s, [key]: e.target.value });

  const toggleBenefit = (value: string) =>
    setEditState((s) => {
      if (!s) return s;
      return {
        ...s,
        benefits: s.benefits.includes(value)
          ? s.benefits.filter((b) => b !== value)
          : [...s.benefits, value],
      };
    });

  const handleSave = () => {
    if (!editState || !selectedId) return;
    setSaveResult(null);
    startTransition(async () => {
      const res = await updateOffer(selectedId, {
        name: editState.name,
        description: editState.description || null,
        offer_desc: editState.offer_desc || null,
        offer_source: editState.offer_source || null,
        benefits: editState.benefits.length > 0 ? editState.benefits : null,
        expires_at: editState.expires_at || null,
        is_active:
          editState.is_active === 'true' ? true
          : editState.is_active === 'false' ? false
          : null,
        verification_status: editState.verification_status || null,
        notes: editState.notes || null,
      });
      setSaveResult(res);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        ← Back
      </button>

      <h2 className="text-lg font-semibold">Modify existing offer</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offer-select">Select an offer</Label>
        {loadingOffers ? (
          <p className="text-sm text-muted-foreground">Loading offers…</p>
        ) : (
          <select
            id="offer-select"
            value={selectedId}
            onChange={(e) => handleSelectOffer(e.target.value)}
            className={selectClass}
          >
            <option value="">— Select an offer —</option>
            {(offers ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>

      {loadingDetail && <p className="text-sm text-muted-foreground">Loading…</p>}

      {editState && offerDetail && (
        <div className="flex flex-col gap-6">
          {saveResult?.success && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Offer updated successfully.
            </div>
          )}
          {saveResult?.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveResult.error}
            </div>
          )}

          <fieldset className="flex flex-col gap-4">
            <legend className="text-base font-semibold mb-2">Offer Details</legend>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">
                Name <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input id="edit-name" value={editState.name} onChange={set('name')} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={editState.description} onChange={set('description')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-offer-desc">Offer Description</Label>
              <Input id="edit-offer-desc" value={editState.offer_desc} onChange={set('offer_desc')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-offer-source">Offer Source</Label>
              <Input id="edit-offer-source" value={editState.offer_source} onChange={set('offer_source')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Benefits</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {BENEFIT_CATEGORIES.map((b) => (
                  <label key={b.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editState.benefits.includes(b.value)}
                      onChange={() => toggleBenefit(b.value)}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-expires-at">Expires At</Label>
                <Input id="edit-expires-at" type="date" value={editState.expires_at} onChange={set('expires_at')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-is-active">Active Status</Label>
                <select
                  id="edit-is-active"
                  value={editState.is_active}
                  onChange={set('is_active')}
                  className={selectClass}
                >
                  <option value="">Not set</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-verification-status">Verification Status</Label>
              <select
                id="edit-verification-status"
                value={editState.verification_status}
                onChange={set('verification_status')}
                className={selectClass}
              >
                <option value="">Not set</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input id="edit-notes" value={editState.notes} onChange={set('notes')} />
            </div>
          </fieldset>

          <Button onClick={handleSave} disabled={isPending || !editState.name}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">
              Locations ({offerDetail.locations.length})
            </h3>
            {offerDetail.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No locations associated with this offer.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {offerDetail.locations.map((loc) => (
                  <div key={loc.id} className="rounded-lg border border-border p-4 text-sm">
                    <p className="font-medium">
                      {loc.address}{loc.address2 ? `, ${loc.address2}` : ''}
                    </p>
                    <p className="text-muted-foreground">
                      {loc.city}, {loc.state} {loc.zip_code}
                    </p>
                    {loc.neighborhood && (
                      <p className="text-muted-foreground">{loc.neighborhood}</p>
                    )}
                    {loc.phone_number && (
                      <p className="text-muted-foreground">{loc.phone_number}</p>
                    )}
                    {loc.notes && (
                      <p className="text-muted-foreground">{loc.notes}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {loc.verification_status ?? 'not set'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
