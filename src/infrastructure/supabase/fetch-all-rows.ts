import type { PostgrestError } from "@supabase/supabase-js";

type Page<Row> = {
  data: Row[] | null;
  error: PostgrestError | null;
  count: number | null;
};

// The Data API returns at most max_rows per request (1,000 here; the hosted limit may differ),
// so this asks page by page, from where the last page ended, until it has the total. Each page
// request must ask for an exact count.
export async function fetchAllRows<Row>(
  fetchPage: (from: number, to: number) => PromiseLike<Page<Row>>,
  onError: (error: PostgrestError) => Error,
  pageSize = 1000,
): Promise<Row[]> {
  const rows: Row[] = [];
  let total = Infinity;
  while (rows.length < total) {
    const { data, error, count } = await fetchPage(
      rows.length,
      rows.length + pageSize - 1,
    );
    if (error) throw onError(error);
    // Rows deleted meanwhile can leave the total out of reach.
    if (!data || data.length === 0) break;
    rows.push(...data);
    total = count ?? rows.length;
  }
  return rows;
}
