/**
 * The single global fallback — the `*` route, and what `Education` renders for an
 * unknown `:section`. One "not found" surface everywhere.
 */
export default function NotFound() {
  return (
    <section aria-labelledby="notfound-heading">
      <h1 id="notfound-heading">Page not found</h1>
      <p>The page you were looking for does not exist.</p>
    </section>
  );
}
