const PDFDocument = require('pdfkit');

function clean(value) {
  return String(value || '').trim();
}

function buildResumePdfBuffer(user) {
  const draft = user.resumeDraft || {};
  const skills = (draft.skills && draft.skills.length ? draft.skills : user.skills) || [];
  const experience = draft.experience || [];
  const education = draft.education || [];

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ink = '#12151C';
    const muted = '#667085';
    const ember = '#FF5C35';

    doc.fillColor(ink).fontSize(22).font('Helvetica-Bold').text(clean(user.name) || 'Applicant');
    doc.moveDown(0.25);
    if (user.headline || draft.summary) {
      doc.fillColor(muted).fontSize(11).font('Helvetica').text(clean(user.headline));
    }
    doc.moveDown(0.35);
    const contact = [clean(user.email), clean(user.phone), clean(user.location)].filter(Boolean).join('  ·  ');
    if (contact) doc.fillColor(muted).fontSize(9).text(contact);
    doc.moveDown(0.6);
    doc.strokeColor(ember).lineWidth(2).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.8);

    const section = (title) => {
      doc.fillColor(ink).fontSize(12).font('Helvetica-Bold').text(title.toUpperCase());
      doc.moveDown(0.35);
      doc.fillColor(ink).font('Helvetica').fontSize(10);
    };

    if (clean(draft.summary)) {
      section('Summary');
      doc.fillColor(ink).font('Helvetica').fontSize(10).text(clean(draft.summary), { align: 'left' });
      doc.moveDown(0.8);
    }

    if (experience.length) {
      section('Experience');
      for (const item of experience) {
        const title = [clean(item.title), clean(item.company)].filter(Boolean).join(' — ');
        if (title) doc.font('Helvetica-Bold').fontSize(10).fillColor(ink).text(title);
        const dates = [clean(item.startDate), item.current ? 'Present' : clean(item.endDate)]
          .filter(Boolean)
          .join(' – ');
        const meta = [dates, clean(item.location)].filter(Boolean).join('  ·  ');
        if (meta) doc.font('Helvetica').fontSize(9).fillColor(muted).text(meta);
        if (clean(item.description)) {
          doc.moveDown(0.2);
          doc.font('Helvetica').fontSize(10).fillColor(ink).text(clean(item.description));
        }
        doc.moveDown(0.55);
      }
    }

    if (education.length) {
      section('Education');
      for (const item of education) {
        const title = [clean(item.degree), clean(item.field)].filter(Boolean).join(' in ');
        const line = [title || clean(item.school), clean(item.school)].filter(Boolean);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(ink).text(line[0] || 'Education');
        if (clean(item.school) && title) doc.font('Helvetica').fontSize(9).fillColor(muted).text(clean(item.school));
        const dates = [clean(item.startDate), clean(item.endDate)].filter(Boolean).join(' – ');
        if (dates) doc.font('Helvetica').fontSize(9).fillColor(muted).text(dates);
        doc.moveDown(0.5);
      }
    }

    if (skills.length) {
      section('Skills');
      doc.font('Helvetica').fontSize(10).fillColor(ink).text(skills.join(', '));
    }

    doc.end();
  });
}

module.exports = { buildResumePdfBuffer };
