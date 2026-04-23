import { useMemo, useState } from 'react';
import type { OCRExtraction, ScannedPage } from '../types';

const STORAGE_KEY = 'journal-digitizer-scanned-pages';

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizePage(page: ScannedPage): ScannedPage {
  return {
    ...page,
    title: page.title.trim() || page.extraction.date || 'Untitled page',
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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const pages = JSON.parse(stored) as ScannedPage[];
    return pages.map(normalizePage);
  } catch {
    return [];
  }
}

function saveStoredPages(pages: ScannedPage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
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
      title: title ?? extraction.date ?? 'Untitled page',
      tags,
      extraction,
      createdAt: now,
      updatedAt: now,
    });

    persist([page, ...pages]);
    return page;
  };

  const updatePage = (pageId: string, updates: Pick<ScannedPage, 'title' | 'tags' | 'extraction'>) => {
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
