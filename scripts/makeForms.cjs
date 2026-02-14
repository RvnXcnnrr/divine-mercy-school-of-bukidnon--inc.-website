const fs = require('fs')
const path = require('path')

function escapePdfString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(oneLineText) {
  const header = '%PDF-1.4\n'
  const content =
    'BT /F1 24 Tf 72 720 Td (' + escapePdfString(oneLineText) + ') Tj ET'

  const stream =
    '<< /Length ' +
    Buffer.byteLength(content, 'binary') +
    ' >>\nstream\n' +
    content +
    '\nendstream\n'

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    '4 0 obj\n' + stream + 'endobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  const buffers = [Buffer.from(header, 'binary')]
  const offsets = [0]

  let pos = buffers[0].length
  for (const obj of objects) {
    offsets.push(pos)
    const b = Buffer.from(obj, 'binary')
    buffers.push(b)
    pos += b.length
  }

  const xrefStart = pos
  let xref = 'xref\n0 ' + offsets.length + '\n'
  xref += '0000000000 65535 f \n'

  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }

  const trailer =
    'trailer\n<< /Size ' +
    offsets.length +
    ' /Root 1 0 R >>\nstartxref\n' +
    xrefStart +
    '\n%%EOF\n'

  buffers.push(Buffer.from(xref + trailer, 'binary'))
  return Buffer.concat(buffers)
}

function writePdf(fileName, label) {
  const out = path.join(process.cwd(), 'public', 'forms', fileName)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, buildPdf(label))
  console.log('Wrote', out)
}

writePdf('Admissions-Form.pdf', 'Admissions Form (Placeholder)')
writePdf('Requirements-Checklist.pdf', 'Requirements Checklist (Placeholder)')
