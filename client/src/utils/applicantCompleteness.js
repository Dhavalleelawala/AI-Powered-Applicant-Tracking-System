/** Shared applicant completeness checks used across applicant pages. */

export function profileChecklist(user = {}) {
  const skills = user.skills || [];
  const items = [
    { id: 'name', label: 'Full name', done: Boolean(user.name?.trim()), required: true, to: '/applicant/profile' },
    { id: 'phone', label: 'Phone number', done: Boolean(user.phone?.trim()), required: true, to: '/applicant/profile' },
    { id: 'headline', label: 'Professional headline', done: Boolean(user.headline?.trim()), required: true, to: '/applicant/profile' },
    { id: 'location', label: 'Location', done: Boolean(user.location?.trim()), required: true, to: '/applicant/profile' },
    { id: 'experience', label: 'Years of experience', done: Number(user.experienceYears) >= 0 && user.experienceYears !== '' && user.experienceYears != null, required: true, to: '/applicant/profile' },
    { id: 'skills', label: 'At least 3 skills', done: skills.length >= 3, required: true, to: '/applicant/profile' },
    { id: 'availability', label: 'Availability', done: Boolean(user.availability), required: true, to: '/applicant/profile' },
    { id: 'workAuth', label: 'Work authorization', done: Boolean(user.workAuthorization?.trim()), required: false, to: '/applicant/profile' },
    { id: 'linkedin', label: 'LinkedIn URL', done: Boolean(user.linkedInUrl?.trim()), required: false, to: '/applicant/profile' },
    { id: 'portfolio', label: 'Portfolio / GitHub', done: Boolean(user.portfolioUrl?.trim()), required: false, to: '/applicant/profile' },
  ];
  return summarize(items);
}

export function resumeChecklist(user = {}) {
  const draft = user.resumeDraft || {};
  const skills = (draft.skills?.length ? draft.skills : user.skills) || [];
  const experience = (draft.experience || []).filter((row) => row.title?.trim() && row.company?.trim());
  const education = (draft.education || []).filter((row) => row.school?.trim());
  const experienceDated = experience.every(
    (row) => row.startDate?.trim() && (row.current || row.endDate?.trim()),
  );
  const educationComplete = education.every(
    (row) => row.degree?.trim() && row.degree !== 'Other' && row.startDate?.trim(),
  );
  const items = [
    { id: 'summary', label: 'Professional summary', done: Boolean(draft.summary?.trim()), required: true, to: '/applicant/resume' },
    { id: 'skills', label: 'At least 3 skills', done: skills.length >= 3, required: true, to: '/applicant/resume' },
    {
      id: 'experience',
      label: 'Experience with dates',
      done: experience.length >= 1 && experienceDated,
      required: true,
      to: '/applicant/resume',
    },
    {
      id: 'education',
      label: 'Education with degree & dates',
      done: education.length >= 1 && educationComplete,
      required: true,
      to: '/applicant/resume',
    },
  ];
  return summarize(items);
}

function summarize(items) {
  const required = items.filter((item) => item.required);
  const doneRequired = required.filter((item) => item.done).length;
  const doneAll = items.filter((item) => item.done).length;
  const percent = required.length ? Math.round((doneRequired / required.length) * 100) : 100;
  return {
    items,
    required,
    missingRequired: required.filter((item) => !item.done),
    percent,
    complete: doneRequired === required.length,
    doneAll,
    total: items.length,
  };
}

export function applicantReadiness(user) {
  const profile = profileChecklist(user);
  const resume = resumeChecklist(user);
  const percent = Math.round((profile.percent + resume.percent) / 2);
  return {
    profile,
    resume,
    percent,
    readyToApply: profile.complete && resume.complete,
  };
}
