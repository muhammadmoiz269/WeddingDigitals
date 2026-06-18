import Link from 'next/link';

interface NoScriptProductLinksProps {
  cards: { slug: string; name: string }[];
}

/**
 * Crawlers that don't execute JS (and users with JS disabled) only see the
 * first batch rendered by the server; the rest load via client-side
 * IntersectionObserver. This renders a plain link list of every product in
 * the current filter so they're all reachable without JS.
 */
export default function NoScriptProductLinks({ cards }: NoScriptProductLinksProps) {
  if (cards.length === 0) return null;

  return (
    <noscript>
      <ul>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link href={`/product/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </noscript>
  );
}
