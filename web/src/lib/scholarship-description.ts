export type ScholarshipDescriptionSections = {
  overview: string[]
  award: string[]
  eligibleCountries: string[]
  eligibility: string[]
  application: string[]
}

const SECTION_LABELS: Array<[keyof Omit<ScholarshipDescriptionSections, 'overview'>, RegExp]> = [
  [
    'award',
    /^(?:number of awards|number of scholarships|award amount|scholarship amount|amount|award value|scholarship value|value|award details|scholarship benefits|benefits|funding|award)\s*:?\s*(.*)$/i,
  ],
  [
    'eligibleCountries',
    /^(?:eligible countries|eligible country|countries eligible|eligible nationalities)\s*:?\s*(.*)$/i,
  ],
  [
    'eligibility',
    /^(?:eligibility|eligibility requirements|who can apply|requirements|qualifications)\s*:?\s*(.*)$/i,
  ],
  [
    'application',
    /^(?:how to apply|application steps|application process|application procedure|to apply|application)\s*:?\s*(.*)$/i,
  ],
]

export function parseScholarshipDescription(value: string | null | undefined): ScholarshipDescriptionSections {
  const sections: ScholarshipDescriptionSections = {
    overview: [],
    award: [],
    eligibleCountries: [],
    eligibility: [],
    application: [],
  }
  let activeSection: keyof Omit<ScholarshipDescriptionSections, 'overview'> | null = null

  for (const rawLine of (value ?? '').split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*(?:[-•]\s*|\d+[.)]\s*)/, '').trim()
    if (!line || /^read more$/i.test(line)) continue

    const matchedLabel = SECTION_LABELS.find(([, pattern]) => pattern.test(line))
    if (matchedLabel) {
      activeSection = matchedLabel[0]
      const inlineDetail = line.match(matchedLabel[1])?.[1]?.trim()
      if (inlineDetail) sections[activeSection].push(inlineDetail)
      continue
    }

    if (/^(?:award|eligibility|application|how to apply|who can apply)\s*:?\s*$/i.test(line)) {
      activeSection = line.toLowerCase().startsWith('how to apply') ? 'application' :
        line.toLowerCase().startsWith('eligibility') || line.toLowerCase().startsWith('who can apply') ? 'eligibility' :
          line.toLowerCase() === 'application' ? 'application' : 'award'
      continue
    }

    sections[activeSection ?? 'overview'].push(line)
  }

  return sections
}
