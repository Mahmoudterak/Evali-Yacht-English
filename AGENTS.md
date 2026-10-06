# Phase 0 Cleanup Rules

Production: `https://evaliyachts.com/`.

This branch is a Phase 0 remediation Draft only. Preserve every existing route, canonical and sitemap entry while ownership evidence is reviewed. Do not add redirects, consolidations, `hreflang`, cross-network editorial links, authority assets or production deployment changes.

Remove or soften unsupported ratings, reviews, totals, awards, guarantees, opening hours, addresses, fixed packages, inclusions, availability and identity-dependent claims. Do not emit `LocalBusiness`, `Product`, `Review`, `AggregateRating` or unverified `Offer` data. Do not infer media rights.

The sites are not approved page-for-page language equivalents. The owner's October 2026 navigation approval permits only a normal homepage link to `https://evaliyacht.com/`, with visible decorative 🇦🇪 + `العربية` and accessible label `Visit our Arabic website`, on desktop and mobile. This is language-site navigation, not an editorial backlink or an hreflang declaration. Do not add automatic language redirects or change metadata, canonicals, sitemap ownership or alternates. All PRs remain Draft, require a Deploy Preview and stop for owner review. Never merge or deploy this branch automatically.

Required validation is truthful: run `npm ci`, lint, typecheck, tests, build, `phase0:check`, audit and `git diff --check`; document pre-existing failures without weakening checks.
