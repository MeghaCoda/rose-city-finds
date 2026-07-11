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
import {
  PRICE_TYPES,
  ELIGIBILITY_TYPES,
  VENUE_TYPES,
  selectClass,
  BACK_LABEL,
  LOADING_LABEL,
  OFFER_DETAILS_LEGEND,
  NAME_LABEL,
  DESCRIPTION_LABEL,
  VENUE_TYPE_LABEL,
  OFFER_DESC_LABEL,
  PRICE_TYPE_LABEL,
  ELIGIBILITY_LABEL,
  EXPIRES_AT_LABEL,
  ACTIVE_STATUS_LABEL,
  VERIFICATION_STATUS_LABEL,
  NOTES_LABEL,
  STATUS_NOT_SET,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_PENDING,
  STATUS_APPROVED,
  STATUS_REJECTED,
  SAVING_LABEL,
  SAVE_CHANGES_LABEL,
  OFFER_UPDATED_SUCCESS,
  MODIFY_PANEL_TITLE,
  SELECT_OFFER_LABEL,
  LOADING_OFFERS_LABEL,
  SELECT_OFFER_PLACEHOLDER,
  LOCATIONS_SECTION_TITLE,
  NO_LOCATIONS_MESSAGE,
} from './uploadConstants';

type EditState = {
  name: string;
  description: string;
  venue_type: string;
  offer_desc: string;
  price_type: string[];
  eligibility: string[];
  expires_at: string;
  is_active: string;
  verification_status: string;
  notes: string;
};

function offerToEditState(offer: OfferDetail): EditState {
  return {
    name: offer.name,
    description: offer.description ?? '',
    venue_type: offer.venue_type,
    offer_desc: offer.offer_desc ?? '',
    price_type: offer.price_type ?? [],
    eligibility: offer.eligibility ?? [],
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

  const set = (key: Exclude<keyof EditState, 'price_type' | 'eligibility'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditState((s) => s && { ...s, [key]: e.target.value });

  const togglePriceType = (value: string) =>
    setEditState((s) => {
      if (!s) return s;
      return {
        ...s,
        price_type: s.price_type.includes(value)
          ? s.price_type.filter((v) => v !== value)
          : [...s.price_type, value],
      };
    });

  const toggleEligibility = (value: string) =>
    setEditState((s) => {
      if (!s) return s;
      return {
        ...s,
        eligibility: s.eligibility.includes(value)
          ? s.eligibility.filter((v) => v !== value)
          : [...s.eligibility, value],
      };
    });

  const handleSave = () => {
    if (!editState || !selectedId || !offerDetail) return;
    setSaveResult(null);
    startTransition(async () => {
      const res = await updateOffer(selectedId, offerDetail.offer_id, {
        name: editState.name,
        description: editState.description || null,
        venue_type: editState.venue_type,
        offer_desc: editState.offer_desc || null,
        price_type: editState.price_type.length > 0 ? editState.price_type : null,
        eligibility: editState.eligibility.length > 0 ? editState.eligibility : null,
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
        {BACK_LABEL}
      </button>

      <h2 className="text-lg font-semibold">{MODIFY_PANEL_TITLE}</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offer-select">{SELECT_OFFER_LABEL}</Label>
        {loadingOffers ? (
          <p className="text-sm text-muted-foreground">{LOADING_OFFERS_LABEL}</p>
        ) : (
          <select
            id="offer-select"
            value={selectedId}
            onChange={(e) => handleSelectOffer(e.target.value)}
            className={selectClass}
          >
            <option value="">{SELECT_OFFER_PLACEHOLDER}</option>
            {(offers ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>

      {loadingDetail && <p className="text-sm text-muted-foreground">{LOADING_LABEL}</p>}

      {editState && offerDetail && (
        <div className="flex flex-col gap-6">
          {saveResult?.success && (
            <div className="rounded-lg border px-4 py-3 text-sm">
              {OFFER_UPDATED_SUCCESS}
            </div>
          )}
          {saveResult?.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveResult.error}
            </div>
          )}

          <fieldset className="flex flex-col gap-4">
            <legend className="text-base font-semibold mb-2">{OFFER_DETAILS_LEGEND}</legend>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">
                {NAME_LABEL} <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input id="edit-name" value={editState.name} onChange={set('name')} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">{DESCRIPTION_LABEL}</Label>
              <Input id="edit-description" value={editState.description} onChange={set('description')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-venue-type">{VENUE_TYPE_LABEL}</Label>
              <select
                id="edit-venue-type"
                value={editState.venue_type}
                onChange={set('venue_type')}
                className={selectClass}
              >
                {VENUE_TYPES.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-offer-desc">{OFFER_DESC_LABEL}</Label>
              <Input id="edit-offer-desc" value={editState.offer_desc} onChange={set('offer_desc')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{PRICE_TYPE_LABEL}</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {PRICE_TYPES.map((p) => (
                  <label key={p.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editState.price_type.includes(p.value)}
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
                      checked={editState.eligibility.includes(el.value)}
                      onChange={() => toggleEligibility(el.value)}
                    />
                    {el.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-expires-at">{EXPIRES_AT_LABEL}</Label>
                <Input id="edit-expires-at" type="date" value={editState.expires_at} onChange={set('expires_at')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-is-active">{ACTIVE_STATUS_LABEL}</Label>
                <select
                  id="edit-is-active"
                  value={editState.is_active}
                  onChange={set('is_active')}
                  className={selectClass}
                >
                  <option value="">{STATUS_NOT_SET}</option>
                  <option value="true">{STATUS_ACTIVE}</option>
                  <option value="false">{STATUS_INACTIVE}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-verification-status">{VERIFICATION_STATUS_LABEL}</Label>
              <select
                id="edit-verification-status"
                value={editState.verification_status}
                onChange={set('verification_status')}
                className={selectClass}
              >
                <option value="">{STATUS_NOT_SET}</option>
                <option value="pending">{STATUS_PENDING}</option>
                <option value="verified">{STATUS_APPROVED}</option>
                <option value="rejected">{STATUS_REJECTED}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-notes">{NOTES_LABEL}</Label>
              <Input id="edit-notes" value={editState.notes} onChange={set('notes')} />
            </div>
          </fieldset>

          <Button onClick={handleSave} disabled={isPending || !editState.name}>
            {isPending ? SAVING_LABEL : SAVE_CHANGES_LABEL}
          </Button>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">
              {LOCATIONS_SECTION_TITLE} ({offerDetail.locations.length})
            </h3>
            {offerDetail.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{NO_LOCATIONS_MESSAGE}</p>
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
