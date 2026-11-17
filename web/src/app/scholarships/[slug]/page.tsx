import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { getScholarshipBySlug } from '@/lib/scholarships.server'
import { formatDeadline } from '@/lib/listings'
import OpportunityActions from '@/components/OpportunityActions'
import OpportunityRequirements from '@/components/OpportunityRequirements'
import { scholarshipRequirements } from '@/lib/opportunity-requirements'
import { parseScholarshipDescription } from '@/lib/scholarship-description'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const scholarship = await getScholarshipBySlug(slug)
  return { title: scholarship?.name ?? 'Scholarship' }
}

export default async function ScholarshipDetail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params
  const { preview } = await searchParams
  const { isAdmin } = await getCurrentUser()
  const scholarship = await getScholarshipBySlug(slug, preview === '1' && isAdmin)
  if (!scholarship) notFound()
  const description = parseScholarshipDescription(scholarship.description)
  const requirements = scholarshipRequirements(scholarship)
  const eligibleCountries = description.eligibleCountries.length
    ? description.eligibleCountries
    : requirements
      .filter(({ label }) => /nationality|eligible (?:location|countries)/i.test(label))
      .map(({ detail }) => detail)
  const eligibility = requirements.filter(({ label }) =>
    !/nationality|eligible (?:location|countries)/i.test(label) &&
    !(description.eligibility.length && /^eligibility$/i.test(label)),
  )
  eligibility.push(...description.eligibility.map((detail) => ({ label: 'Eligibility', detail })))

  return <main className="mx-auto max-w-[760px] px-5 py-12">
    <Link href="/scholarships" className="text-sm font-semibold text-clay no-underline">Back to scholarships</Link>
    {!scholarship.published && <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">Preview mode: this scholarship is not public.</p>}
    <p className="mt-10 text-sm font-bold uppercase tracking-[0.1em] text-clay">{scholarship.funder}</p>
    <h1 className="mt-3 font-display text-4xl font-semibold">{scholarship.name}</h1>
    <p className="mt-4 text-muted">{scholarship.country} · {scholarship.field} · {scholarship.degree_level} · {scholarship.deadline ? `Deadline ${formatDeadline(scholarship.deadline)}` : 'Rolling deadline'}</p>
    {description.award.length > 0 && (
      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Award details</h2>
        <ul className="mt-3 space-y-2 text-[0.95rem] leading-[1.7] text-muted">
          {description.award.map((detail, index) => <li key={index}>{detail}</li>)}
        </ul>
      </section>
    )}
    {eligibleCountries.length > 0 && (
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Eligible countries</h2>
        <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-[1.7] text-muted">
          {eligibleCountries.join('\n')}
        </p>
      </section>
    )}
    <OpportunityRequirements requirements={eligibility} heading="Eligibility" />
    {description.application.length > 0 && (
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">How to apply</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[0.95rem] leading-[1.7] text-muted">
          {description.application.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </section>
    )}
    {description.overview.length > 0 && (
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Overview</h2>
        <p className="mt-3 whitespace-pre-wrap text-[1rem] leading-[1.8] text-muted">
          {description.overview.join('\n')}
        </p>
      </section>
    )}
    {!scholarship.description && !scholarship.eligibility && (
      <p className="mt-10 text-[1rem] leading-[1.8] text-muted">
        Review the eligibility requirements and apply through the original provider.
      </p>
    )}
    <OpportunityActions kind="scholarship" opportunityId={scholarship.id} applyUrl={scholarship.apply_url} />
    {scholarship.source_name && <p className="mt-6 text-sm text-muted">Source: {scholarship.source_url ? <a href={scholarship.source_url} className="text-clay">{scholarship.source_name}</a> : scholarship.source_name}{scholarship.verified_at ? ` · Verified ${new Date(scholarship.verified_at).toLocaleDateString('en-GB')}` : ''}</p>}
  </main>
}