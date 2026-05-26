import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string; // omit for current page (last item)
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-charcoal/50">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-champagne transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-charcoal/80 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
