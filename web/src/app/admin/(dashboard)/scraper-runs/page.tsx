import { createClient } from '@/lib/supabase/server'
import type { ScraperRunRow } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function ScraperRunsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  const runs = (data ?? []) as ScraperRunRow[]

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Scraper runs</h1>
        <p className="mt-1 text-[0.92rem] text-muted">
          Recent scheduled runs, saved in the database so they remain available beyond Vercel log retention.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-6 text-[0.9rem] leading-[1.7] text-[#8b3a1a]">
          <h2 className="font-display text-xl font-semibold">Could not load scraper history</h2>
          {error.code === 'PGRST205'
            ? <p className="mt-2">Apply <code>supabase/migrations/0014_scraper_run_history.sql</code> in the Supabase SQL editor, then reload this page.</p>
            : <p className="mt-2">{error.message}</p>}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-10 text-center">
          <h2 className="font-display text-xl font-semibold">No scraper runs recorded yet</h2>
          <p className="mt-2 text-[0.9rem] text-muted">
            Once the migration is applied and the updated production deployment runs the cron, its result will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {runs.map((run) => (
            <li key={run.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">
                  {new Date(run.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </h2>
                <div className="flex flex-wrap gap-2 text-[0.75rem] font-bold uppercase">
                  <Badge>{run.dry_run ? 'Dry run' : 'Write run'}</Badge>
                  <Badge>{run.inserted} inserted</Badge>
                  {run.failed_sources > 0 && <Badge tone="error">{run.failed_sources} source errors</Badge>}
                  {run.notified && <Badge tone="success">Email sent</Badge>}
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-cream p-4 text-[0.8rem] leading-[1.6] text-ink">
                {JSON.stringify(run.results, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'error' | 'success' }) {
  const colors = {
    default: 'bg-cream-deep text-muted',
    error: 'bg-[#fff0eb] text-[#8b3a1a]',
    success: 'bg-moss/10 text-moss',
  }
  return <span className={`rounded-full px-3 py-1 ${colors[tone]}`}>{children}</span>
}
