/** Shared recruiter decision helpers — rejection presets and common tags. */

export const REJECTION_PRESETS = [
  'Skills mismatch',
  'Experience below requirement',
  'Compensation misalignment',
  'Role filled / headcount closed',
  'Culture / team fit',
  'Incomplete application',
  'Candidate withdrew',
];

export const TAG_PRESETS = ['referral', 'strong fit', 'passive', 'internal', 'priority', 'campus'];

export const SCORECARD_CRITERIA = ['Skills', 'Experience', 'Communication', 'Culture'];

export const SCORECARD_RECOMMENDATIONS = [
  { value: '', label: 'No recommendation yet' },
  { value: 'strong_yes', label: 'Strong yes' },
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
];

export function emptyScorecard() {
  return {
    criteria: SCORECARD_CRITERIA.map((label) => ({ label, score: 0 })),
    recommendation: '',
    note: '',
    updatedAt: null,
  };
}

export function recommendationLabel(value) {
  return SCORECARD_RECOMMENDATIONS.find((row) => row.value === value)?.label || '';
}

export const NEXT_STAGE = {
  applied: 'interview',
  interview: 'offered',
  offered: null,
  rejected: null,
};
