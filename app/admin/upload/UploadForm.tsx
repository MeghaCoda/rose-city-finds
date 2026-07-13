'use client';

import { useState } from 'react';
import { OfferEntryForm } from './OfferEntryForm';
import { ModifyOfferPanel } from './ModifyOfferPanel';
import { ApprovalPanel } from './ApprovalPanel';
import {
  BACK_LABEL,
  MODE_SELECTOR_HEADER,
  UPLOAD_NEW_TITLE,
  UPLOAD_NEW_DESC,
  MODIFY_TITLE,
  MODIFY_DESC,
  APPROVE_TITLE,
  APPROVE_DESC,
  UPLOAD_PANEL_TITLE,
  UPLOAD_PANEL_SUBTITLE,
} from './uploadConstants';

type Mode = 'select' | 'upload' | 'modify' | 'approve';

export function UploadForm({ adminUserId }: { adminUserId: string }) {
  const [mode, setMode] = useState<Mode>('select');

  if (mode === 'upload') {
    return <UploadPanel adminUserId={adminUserId} onBack={() => setMode('select')} />;
  }

  if (mode === 'modify') {
    return <ModifyOfferPanel onBack={() => setMode('select')} />;
  }

  if (mode === 'approve') {
    return <ApprovalPanel onBack={() => setMode('select')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{MODE_SELECTOR_HEADER}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('upload')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">{UPLOAD_NEW_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{UPLOAD_NEW_DESC}</p>
        </button>
        <button
          onClick={() => setMode('modify')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">{MODIFY_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{MODIFY_DESC}</p>
        </button>
        <button
          onClick={() => setMode('approve')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors col-span-2"
        >
          <p className="font-semibold">{APPROVE_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{APPROVE_DESC}</p>
        </button>
      </div>
    </div>
  );
}

function UploadPanel({ adminUserId, onBack }: { adminUserId: string; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        {BACK_LABEL}
      </button>

      <div>
        <h2 className="text-lg font-semibold">{UPLOAD_PANEL_TITLE}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{UPLOAD_PANEL_SUBTITLE}</p>
      </div>

      <OfferEntryForm adminUserId={adminUserId} />
    </div>
  );
}
