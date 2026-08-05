const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const config = require('../config');

let transporter;

const emailLogSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    to: String,
    template: String,
    status: { type: String, enum: ['sent', 'failed', 'console', 'disabled'], default: 'console' },
    providerMessageId: String,
    error: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

function buildStageContent({ applicant, job, stage }) {
  const name = applicant?.name || 'there';
  const title = job?.title || 'the role';
  const subjects = {
    interview: `Rolefit — Interview invitation: ${title}`,
    offered: `Rolefit — Offer update: ${title}`,
    rejected: `Rolefit — Application update: ${title}`,
  };
  const bodies = {
    interview: {
      text: `Hi ${name},\n\nGreat news — your application for "${title}" has moved to the interview stage on Rolefit.\nThe hiring team will follow up with next steps.\n\n— Rolefit`,
      html: `<p>Hi ${name},</p><p>Great news — your application for <strong>${title}</strong> has moved to the <strong>interview</strong> stage on Rolefit.</p><p>The hiring team will follow up with next steps.</p><p>— Rolefit</p>`,
    },
    offered: {
      text: `Hi ${name},\n\nCongratulations — your application for "${title}" has moved to offered on Rolefit.\nExpect details from the hiring team shortly.\n\n— Rolefit`,
      html: `<p>Hi ${name},</p><p>Congratulations — your application for <strong>${title}</strong> has moved to <strong>offered</strong> on Rolefit.</p><p>Expect details from the hiring team shortly.</p><p>— Rolefit</p>`,
    },
    rejected: {
      text: `Hi ${name},\n\nThank you for applying to "${title}" on Rolefit. After review, we will not be moving forward at this time.\nWe appreciate your interest and wish you the best.\n\n— Rolefit`,
      html: `<p>Hi ${name},</p><p>Thank you for applying to <strong>${title}</strong> on Rolefit. After review, we will not be moving forward at this time.</p><p>We appreciate your interest and wish you the best.</p><p>— Rolefit</p>`,
    },
  };
  return { subject: subjects[stage], ...(bodies[stage] || { text: '', html: '' }) };
}

async function sendEmail({ to, subject, text, html, applicationId, template }) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Rolefit email] To: ${to}\nSubject: ${subject}\n${text}`);
    await EmailLog.create({
      applicationId,
      to,
      template,
      status: 'console',
    }).catch(() => undefined);
    return { delivered: false, mode: 'console' };
  }

  try {
    const info = await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text,
      html,
    });
    await EmailLog.create({
      applicationId,
      to,
      template,
      status: 'sent',
      providerMessageId: info.messageId,
    }).catch(() => undefined);
    return { delivered: true, mode: 'smtp', messageId: info.messageId };
  } catch (err) {
    await EmailLog.create({
      applicationId,
      to,
      template,
      status: 'failed',
      error: String(err.message || err).slice(0, 500),
    }).catch(() => undefined);
    throw err;
  }
}

async function sendStageEmail({ applicant, job, stage, applicationId }) {
  if (stage === 'rejected' && !config.sendRejectionEmails) {
    await EmailLog.create({
      applicationId,
      to: applicant?.email,
      template: stage,
      status: 'disabled',
    }).catch(() => undefined);
    return { delivered: false, mode: 'disabled' };
  }

  const content = buildStageContent({ applicant, job, stage });
  if (!content.subject || !applicant?.email) {
    return { delivered: false, mode: 'skipped' };
  }

  return sendEmail({
    to: applicant.email,
    subject: content.subject,
    text: content.text,
    html: content.html,
    applicationId,
    template: stage,
  });
}

module.exports = { sendEmail, sendStageEmail, EmailLog };
