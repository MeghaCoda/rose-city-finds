'use client';

import { useEffect, useState, useTransition } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchBusinesses, type BusinessOption } from './actions';
import {
  BUSINESS_SEARCH_PLACEHOLDER,
  BUSINESS_SEARCHING_LABEL,
  CREATE_NEW_BUSINESS_PREFIX,
} from './uploadConstants';

const CREATE_NEW_ID = '__create_new__';

type ComboboxOption = BusinessOption | { id: typeof CREATE_NEW_ID; name: string };

export function BusinessCombobox({
  value,
  onSelectExisting,
  onCreateNew,
}: {
  value: BusinessOption | null;
  onSelectExisting: (business: BusinessOption) => void;
  onCreateNew: (name: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value?.name ?? '');
  const [results, setResults] = useState<BusinessOption[]>([]);
  const [open, setOpen] = useState(false);
  const [isSearching, startTransition] = useTransition();
  const debouncedInput = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    const trimmed = debouncedInput.trim();
    startTransition(async () => {
      if (trimmed.length === 0) {
        setResults([]);
        return;
      }
      const found = await searchBusinesses(trimmed);
      setResults(found);
    });
  }, [debouncedInput]);

  const trimmedInput = inputValue.trim();
  const hasExactMatch = results.some(
    (b) => b.name.toLowerCase() === trimmedInput.toLowerCase()
  );
  const items: ComboboxOption[] =
    trimmedInput.length > 0 && !hasExactMatch
      ? [...results, { id: CREATE_NEW_ID, name: trimmedInput }]
      : results;

  function handleValueChange(item: ComboboxOption | null) {
    if (!item) return;
    if (item.id === CREATE_NEW_ID) {
      onCreateNew(item.name);
    } else {
      onSelectExisting(item);
    }
  }

  return (
    <Combobox.Root
      items={items}
      filter={null}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      value={value}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={setOpen}
      itemToStringLabel={(item: ComboboxOption) => item.name}
      isItemEqualToValue={(a: ComboboxOption, b: ComboboxOption) => a.id === b.id}
    >
      <Combobox.Input placeholder={BUSINESS_SEARCH_PLACEHOLDER} />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            {isSearching && <Combobox.Status>{BUSINESS_SEARCHING_LABEL}</Combobox.Status>}
            <Combobox.Empty>No matches.</Combobox.Empty>
            <Combobox.List>
              {(item: ComboboxOption) => (
                <Combobox.Item key={item.id} value={item}>
                  {item.id === CREATE_NEW_ID
                    ? `${CREATE_NEW_BUSINESS_PREFIX}${item.name}"`
                    : item.name}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
