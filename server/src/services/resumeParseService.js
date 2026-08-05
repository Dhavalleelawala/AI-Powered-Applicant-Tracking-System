const mammoth = require('mammoth');
const AppError = require('../utils/AppError');

async function extractResumeText(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      if (typeof pdfParse === 'function') {
        const result = await pdfParse(buffer);
        return String(result.text || '').trim();
      }
      const parser = new pdfParse.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return String(result.text || '').trim();
      } finally {
        await parser.destroy();
      }
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return String(result.value || '').trim();
    }
  } catch (err) {
    throw new AppError(`Could not parse resume: ${err.message}`, {
      status: 422,
      code: 'RESUME_PARSE_FAILED',
    });
  }

  throw new AppError('Unsupported resume format', {
    status: 400,
    code: 'INVALID_FILE_TYPE',
  });
}

module.exports = { extractResumeText };
