import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = [
  [/^\/$/, 'Rolefit — AI-assisted hiring'],
  [/^\/jobs$/, 'Open roles — Rolefit'],
  [/^\/jobs\/[^/]+$/, 'Role details — Rolefit'],
  [/^\/login$/, 'Sign in — Rolefit'],
  [/^\/register\/applicant$/, 'Join as applicant — Rolefit'],
  [/^\/register\/recruiter$/, 'Start hiring — Rolefit'],
  [/^\/applicant$/, 'Applicant home — Rolefit'],
  [/^\/applicant\/applications$/, 'My applications — Rolefit'],
  [/^\/applicant\/jobs\/[^/]+\/apply$/, 'Apply — Rolefit'],
  [/^\/applicant\/profile$/, 'Profile — Rolefit'],
  [/^\/applicant\/resume$/, 'Resume builder — Rolefit'],
  [/^\/applicant\/saved$/, 'Saved roles — Rolefit'],
  [/^\/recruiter$/, 'Hiring dashboard — Rolefit'],
  [/^\/recruiter\/candidates$/, 'Candidates — Rolefit'],
  [/^\/recruiter\/jobs\/new$/, 'Create role — Rolefit'],
  [/^\/recruiter\/jobs\/[^/]+\/edit$/, 'Edit role — Rolefit'],
  [/^\/recruiter\/jobs\/[^/]+\/applications$/, 'Pipeline — Rolefit'],
  [/^\/recruiter\/jobs\/[^/]+\/ranking$/, 'Ranking — Rolefit'],
];

export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = TITLES.find(([pattern]) => pattern.test(pathname));
    document.title = match ? match[1] : 'Rolefit';
  }, [pathname]);

  return null;
}
