"use server";

import { search, type SearchResult } from "@/modules/search/search.service";

export async function searchAction(query: string): Promise<SearchResult[]> {
  return search(query);
}
