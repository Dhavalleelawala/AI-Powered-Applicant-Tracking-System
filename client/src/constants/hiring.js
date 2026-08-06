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

export const NEXT_STAGE = {
  applied: 'interview',
  interview: 'offered',
  offered: null,
  rejected: null,
};
