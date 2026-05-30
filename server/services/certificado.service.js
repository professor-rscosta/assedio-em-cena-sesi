const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT_DIR = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', 'certificados');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function gerarCodigo() {
  return 'AEC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

/**
 * Gera um PDF de certificado e devolve { codigo, arquivoPath, arquivoUrl }
 */
async function gerarCertificado({ nome, nivelMaturidade, cargaHoraria, badgeDestaque, baseUrl }) {
  const codigo = gerarCodigo();
  const arquivoNome = `${codigo}.pdf`;
  const arquivoPath = path.join(OUT_DIR, arquivoNome);
  const arquivoUrl = `/uploads/certificados/${arquivoNome}`;
  const urlValidacao = `${baseUrl}/validar/${codigo}`;

  const qrDataUrl = await QRCode.toDataURL(urlValidacao, { margin: 1, width: 240 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(arquivoPath);
    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;

    // Fundo
    doc.rect(0, 0, W, H).fill('#0B1020');
    // Moldura neon
    doc.lineWidth(3).strokeColor('#7C5CFF').rect(24, 24, W - 48, H - 48).stroke();
    doc.lineWidth(1).strokeColor('#22C55E').rect(34, 34, W - 68, H - 68).stroke();

    // Cabeçalho
    doc.fillColor('#7C5CFF').fontSize(14).font('Helvetica-Bold')
       .text('ASSÉDIO EM CENA', 0, 70, { align: 'center', characterSpacing: 4 });
    doc.fillColor('#94A3B8').fontSize(10).font('Helvetica')
       .text('Decisões que Transformam o Ambiente de Trabalho', { align: 'center' });

    // Título
    doc.moveDown(2);
    doc.fillColor('#FFFFFF').fontSize(34).font('Helvetica-Bold')
       .text('CERTIFICADO DE CONCLUSÃO', { align: 'center' });

    // Corpo
    doc.moveDown(1.2);
    doc.fillColor('#CBD5E1').fontSize(13).font('Helvetica')
       .text('Certificamos que', { align: 'center' });
    doc.moveDown(0.4);
    doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold')
       .text(nome, { align: 'center' });
    doc.moveDown(0.6);

    const texto =
      `concluiu o programa de prevenção ao assédio moral e sexual no ambiente de trabalho, ` +
      `com carga horária de ${cargaHoraria} hora(s), alcançando o nível de maturidade ` +
      `"${nivelMaturidade}".`;
    doc.fillColor('#CBD5E1').fontSize(13).font('Helvetica')
       .text(texto, 120, doc.y, { align: 'center', width: W - 240 });

    if (badgeDestaque) {
      doc.moveDown(0.8);
      doc.fillColor('#22C55E').fontSize(12).font('Helvetica-Bold')
         .text(`Insígnia de destaque: ${badgeDestaque}`, { align: 'center' });
    }

    // QR + código (rodapé)
    const qrSize = 90;
    doc.image(qrBuffer, W - 150, H - 150, { width: qrSize });
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
       .text('Validação online', W - 150, H - 56, { width: qrSize, align: 'center' });

    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
       .text(`Código: ${codigo}`, 60, H - 70);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 60, H - 56);

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { codigo, arquivoPath, arquivoUrl };
}

module.exports = { gerarCertificado, gerarCodigo };
