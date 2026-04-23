import { useMemo, useState } from 'react';
import type { OCRExtraction, ScannedPage } from '../types';
import { createId } from '../lib/utils';
import { DEFAULT_PAGE_TITLE, STORAGE_KEY_PAGES } from '../constants';

function normalizePage(page: ScannedPage): ScannedPage {
  return {
    ...page,
    title: page.title.trim() || page.extraction.date || DEFAULT_PAGE_TITLE,
    tags: page.tags.map(tag => tag.trim()).filter(Boolean),
    extraction: {
      ...page.extraction,
      entries: page.extraction.entries.map(entry => ({
        ...entry,
        id: entry.id ?? createId(),
      })),
    },
  };
}

function loadStoredPages(): ScannedPage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PAGES);
    if (!stored) return [];
    const pages = JSON.parse(stored) as ScannedPage[];
    return pages.map(normalizePage);
  } catch {
    return [];
  }
}

function saveStoredPages(pages: ScannedPage[]) {
  localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
}

export function useScannedPages() {
  const [pages, setPages] = useState<ScannedPage[]>(loadStoredPages);

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [pages]
  );

  const persist = (nextPages: ScannedPage[]) => {
    setPages(nextPages);
    saveStoredPages(nextPages);
  };

  const addPage = (extraction: OCRExtraction, title?: string, tags: string[] = []) => {
    const now = new Date().toISOString();
    const page = normalizePage({
      id: createId(),
      title: title ?? extraction.date ?? DEFAULT_PAGE_TITLE,
      tags,
      extraction,
      createdAt: now,
      updatedAt: now,
    });

    persist([page, ...pages]);
  };

  const updatePage = (
    pageId: string,
    updates: Pick<ScannedPage, 'title' | 'tags' | 'extraction'>
  ) => {
    const now = new Date().toISOString();
    persist(
      pages.map(page =>
        page.id === pageId
          ? normalizePage({ ...page, ...updates, updatedAt: now })
          : page
      )
    );
  };

  const deletePage = (pageId: string) => {
    persist(pages.filter(page => page.id !== pageId));
  };

  return { pages: sortedPages, addPage, updatePage, deletePage };
}
