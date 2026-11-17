import { describe, expect, it } from 'vitest'
import { parseScholarshipDescription } from './scholarship-description'

describe('parseScholarshipDescription', () => {
  it('separates award, eligible countries, eligibility, and application details from overview text', () => {
    expect(parseScholarshipDescription(`The scholarship supports high-achieving students.
Award Amount: Full tuition fees
Number of Awards: 10
Eligible Countries: Nigeria, Ghana
Eligibility:
- Enrolled in an eligible undergraduate programme
How to Apply:
1. Complete the online form
2. Upload academic transcripts`)).toEqual({
      overview: ['The scholarship supports high-achieving students.'],
      award: ['Full tuition fees', '10'],
      eligibleCountries: ['Nigeria, Ghana'],
      eligibility: ['Enrolled in an eligible undergraduate programme'],
      application: ['Complete the online form', 'Upload academic transcripts'],
    })
  })

  it('ignores a bare Read More teaser', () => {
    expect(parseScholarshipDescription('Bet9ja Foundation Scholarship\nRead More')).toEqual({
      overview: ['Bet9ja Foundation Scholarship'],
      award: [],
      eligibleCountries: [],
      eligibility: [],
      application: [],
    })
  })
})
