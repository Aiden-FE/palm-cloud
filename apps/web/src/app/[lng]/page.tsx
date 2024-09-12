'use client';

import { Listbox, ListboxItem } from '@nextui-org/react';
import { PageProps } from '@/interfaces';

export default function Home({ params: { lng } }: PageProps) {
  return (
    <main className="w-full px-1 py-2">
      <Listbox>
        <ListboxItem key="pureRead" href={`/utils/pure-read`}>
          Pure read
        </ListboxItem>
      </Listbox>
    </main>
  );
}
