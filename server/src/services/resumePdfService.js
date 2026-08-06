const PDFDocument = require('pdfkit');

function clean(value) {
  return String(value || '').trim();
}

/** Turn YYYY-MM / YYYY / free text into a readable resume date. */
function formatResumeDate(value) {
  const raw = clean(value);
  if (!raw) return '';
  if (/^present$/i.test(raw)) return 'Present';
  const monthMatch = raw.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (monthMatch) {
    const year = monthMatch[1];
    const month = Number(monthMatch[2]);
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) return `${names[month - 1]} ${year}`;
  }
  if (/^\d{4}$/.test(raw)) return raw;
  return raw;
}

function dateSortKey(value) {
  const raw = clean(value);
  const match = raw.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!match) return 0;
  return Number(match[1]) * 100 + Number(match[2] || '01');
}

function formatDateRange(start, end, { current = false } = {}) {
  const startLabel = formatResumeDate(start);
  let endLabel = current ? 'Present' : formatResumeDate(end);
  if (startLabel && endLabel && endLabel !== 'Present' && dateSortKey(end) && dateSortKey(start) && dateSortKey(end) < dateSortKey(start)) {
    // Bad data (end before start) — show start only rather than a confusing range.
    endLabel = '';
  }
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel || '';
}

function resumeFilenameFromName(name) {
  const base =
    clean(name)
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Resume';
  return `${base}.pdf`;
}

function buildResumePdfBuffer(user) {
  const draft = user.resumeDraft || {};
  const skills = (draft.skills && draft.skills.length ? draft.skills : user.skills) || [];
  const experience = (draft.experience || []).filter((item) => clean(item.title) || clean(item.company));
  const education = (draft.education || []).filter((item) => clean(item.school) || clean(item.degree));

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 54,
      size: 'LETTER',
      info: {
        Title: `${clean(user.name) || 'Resume'} — Rolefit`,
        Author: clean(user.name) || 'Rolefit',
        Creator: 'Rolefit',
      },
    });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ink = '#0F1218';
    const muted = '#3F4A5C';
    const ember = '#FF5C35';
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    // Header
    doc.fillColor(ink).font('Helvetica-Bold').fontSize(24).text(clean(user.name) || 'Applicant', {
      width: pageWidth,
    });

    if (clean(user.headline)) {
      doc.moveDown(0.2);
      doc.fillColor(muted).font('Helvetica').fontSize(11).text(clean(user.headline), { width: pageWidth });
    }

    const contact = [clean(user.email), clean(user.phone), clean(user.location)].filter(Boolean).join('  ·  ');
    if (contact) {
      doc.moveDown(0.25);
      doc.fillColor(muted).font('Helvetica').fontSize(9).text(contact, { width: pageWidth });
    }

    doc.moveDown(0.55);
    const ruleY = doc.y;
    doc.strokeColor(ember).lineWidth(2.25).moveTo(left, ruleY).lineTo(left + pageWidth, ruleY).stroke();
    doc.moveDown(0.85);

    const section = (title) => {
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text(title.toUpperCase(), { characterSpacing: 0.6 });
      doc.moveDown(0.15);
      doc.strokeColor('#D5DBE5').lineWidth(0.75).moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke();
      doc.moveDown(0.45);
    };

    if (clean(draft.summary)) {
      section('Summary');
      doc.fillColor(ink).font('Helvetica').fontSize(10).text(clean(draft.summary), {
        width: pageWidth,
        align: 'left',
        lineGap: 2,
      });
      doc.moveDown(0.75);
    }

    if (experience.length) {
      section('Experience');
      experience.forEach((item, index) => {
        const title = clean(item.title);
        const company = clean(item.company);
        const heading = title && company ? `${title} — ${company}` : title || company;
        if (heading) {
          doc.fillColor(ink).font('Helvetica-Bold').fontSize(10.5).text(heading, { width: pageWidth });
        }

        const meta = [
          formatDateRange(item.startDate, item.endDate, { current: Boolean(item.current) }),
          clean(item.employmentType),
          clean(item.location),
        ]
          .filter(Boolean)
          .join('  ·  ');
        if (meta) {
          doc.moveDown(0.08);
          doc.fillColor(muted).font('Helvetica').fontSize(9).text(meta, { width: pageWidth });
        }

        if (clean(item.description)) {
          doc.moveDown(0.2);
          doc.fillColor(ink).font('Helvetica').fontSize(10).text(clean(item.description), {
            width: pageWidth,
            lineGap: 1.5,
          });
        }

        if (index < experience.length - 1) doc.moveDown(0.55);
      });
      doc.moveDown(0.75);
    }

    if (education.length) {
      section('Education');
      education.forEach((item, index) => {
        const school = clean(item.school);
        const degree = clean(item.degree) === 'Other' ? '' : clean(item.degree);
        const field = clean(item.field);
        const credential = [degree, field].filter(Boolean).join(' in ');

        if (school) {
          doc.fillColor(ink).font('Helvetica-Bold').fontSize(10.5).text(school, { width: pageWidth });
        }
        if (credential) {
          doc.moveDown(0.08);
          doc.fillColor(ink).font('Helvetica').fontSize(10).text(credential, { width: pageWidth });
        }

        const dates = formatDateRange(item.startDate, item.endDate);
        if (dates) {
          doc.moveDown(0.08);
          doc.fillColor(muted).font('Helvetica').fontSize(9).text(dates, { width: pageWidth });
        }

        if (index < education.length - 1) doc.moveDown(0.55);
      });
      doc.moveDown(0.75);
    }

    if (skills.length) {
      section('Skills');
      doc.fillColor(ink).font('Helvetica').fontSize(10).text(skills.map(clean).filter(Boolean).join('  ·  '), {
        width: pageWidth,
        lineGap: 2,
      });
    }

    doc.end();
  });
}

module.exports = { buildResumePdfBuffer, resumeFilenameFromName, formatResumeDate };
