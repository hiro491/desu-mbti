import Image from "next/image";
import type { MemberCompany } from "@/data/member-companies";

interface MemberCompanyListProps {
  companies: MemberCompany[];
}

export function MemberCompanyList({ companies }: MemberCompanyListProps) {
  if (companies.length === 0) return null;

  return (
    <div className="mt-6 border-t border-dawn-border pt-5">
      <p className="text-xs font-bold tracking-widest text-dawn-muted">
        会員企業
      </p>
      <ul className="mt-3 space-y-3">
        {companies.map((company) => (
          <li key={company.id}>
            <MemberCompanyCard company={company} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemberCompanyCard({ company }: { company: MemberCompany }) {
  const content = (
    <div className="flex items-center gap-4 rounded-lg border border-dawn-border bg-dawn-surface/60 p-3 sm:p-4">
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-dawn-border bg-white sm:w-32">
        {company.logoPath ? (
          <Image
            src={company.logoPath}
            alt={`${company.name}のロゴ`}
            fill
            className={
              company.logoScale
                ? "object-contain"
                : "object-contain p-2"
            }
            sizes="128px"
            style={
              company.logoScale
                ? { transform: `scale(${company.logoScale})` }
                : undefined
            }
          />
        ) : (
          <span className="sr-only">{company.name}のロゴ（準備中）</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-dawn-text">{company.name}</p>
        <p className="mt-1 text-sm leading-6 text-dawn-muted">
          {company.overview}
        </p>
      </div>
    </div>
  );

  if (company.url) {
    return (
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg transition hover:bg-dawn-surface"
      >
        {content}
      </a>
    );
  }

  return content;
}
