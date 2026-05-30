const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, process.env.UPLOAD_DIR || 'uploads', 'certificados');
const ASSET_LOGO = path.join(ROOT, 'client', 'images', 'logo-sesi.png');
const ASSET_TEO = path.join(ROOT, 'client', 'images', 'personagem-teo.png');
const ASSET_BIA = path.join(ROOT, 'client', 'images', 'personagem-bia.png');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function gerarCodigo() {
  return 'AEC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}
function existe(p) { try { return fs.existsSync(p); } catch { return false; } }

const NIVEL_LABEL = { observador: 'Observador Inicial', agente: 'Agente Consciente', guardiao: 'Guardiao do Respeito' };

async function gerarCertificado({ nome, nivelMaturidade, cargaHoraria, badgeDestaque, personagem = 'teo', baseUrl }) {
  const codigo = gerarCodigo();
  const arquivoNome = `${codigo}.pdf`;
  const arquivoPath = path.join(OUT_DIR, arquivoNome);
  const arquivoUrl = `/uploads/certificados/${arquivoNome}`;
  const urlValidacao = `${baseUrl}/validar/${codigo}`;

  const qrDataUrl = await QRCode.toDataURL(urlValidacao, { margin: 1, width: 240 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const charPath = personagem === 'bia' ? ASSET_BIA : ASSET_TEO;
  const nivelTxt = NIVEL_LABEL[nivelMaturidade] || nivelMaturidade;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(arquivoPath);
    doc.pipe(stream);
    const W = doc.page.width, H = doc.page.height;

    doc.rect(0, 0, W, H).fill('#06101F');
    doc.rect(0, 0, W, 8).fill('#0A4FA0');
    doc.rect(0, H - 8, W, 8).fill('#5BA829');
    doc.lineWidth(2).strokeColor('#0A4FA0').rect(26, 26, W - 52, H - 52).stroke();
    doc.lineWidth(1).strokeColor('#5BA829').rect(34, 34, W - 68, H - 68).stroke();

    if (existe(ASSET_LOGO)) {
      doc.roundedRect(60, 54, 190, 60, 8).fill('#FFFFFF');
      doc.image(ASSET_LOGO, 72, 66, { fit: [166, 36] });
    }
    if (existe(charPath)) {
      try { doc.image(charPath, W - 250, 120, { fit: [200, 360] }); } catch (_) {}
    }

    doc.fillColor('#5BA829').fontSize(12).font('Helvetica-Bold')
       .text('SEGURANCA E SAUDE NO TRABALHO', 60, 130, { characterSpacing: 3 });
    doc.fillColor('#FFFFFF').fontSize(30).font('Helvetica-Bold')
       .text('CERTIFICADO DE CONCLUSAO', 60, 150);
    doc.fillColor('#9DB2D6').fontSize(13).font('Helvetica')
       .text('Programa Assedio em Cena - Decisoes que Transformam o Ambiente de Trabalho', 60, 188, { width: W - 320 });

    doc.fillColor('#9DB2D6').fontSize(12).font('Helvetica').text('Certificamos que', 60, 240);
    doc.fillColor('#FFFFFF').fontSize(30).font('Helvetica-Bold').text(nome, 60, 258, { width: W - 320 });

    doc.fillColor('#CBD5E1').fontSize(12).font('Helvetica')
       .text(`concluiu o Modulo 1 do programa, com carga horaria de ${cargaHoraria} hora(s), demonstrando capacidade de reconhecer e prevenir situacoes de assedio no ambiente industrial.`,
         60, 304, { width: W - 330, lineGap: 3 });

    const boxY = 366;
    doc.roundedRect(60, boxY, 260, 56, 8).fillAndStroke('#0A1428', '#0A4FA0');
    doc.fillColor('#5BA829').fontSize(9).font('Helvetica-Bold').text('NIVEL DE MATURIDADE', 74, boxY + 12, { characterSpacing: 1 });
    doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text(nivelTxt, 74, boxY + 28);

    if (badgeDestaque) {
      doc.roundedRect(338, boxY, 260, 56, 8).fillAndStroke('#0A1428', '#5BA829');
      doc.fillColor('#5BA829').fontSize(9).font('Helvetica-Bold').text('INSIGNIA CONQUISTADA', 352, boxY + 12, { characterSpacing: 1 });
      doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text(badgeDestaque, 352, boxY + 28, { width: 232 });
    }

    doc.image(qrBuffer, 60, H - 150, { width: 84 });
    doc.fillColor('#9DB2D6').fontSize(8).font('Helvetica').text('Validacao online', 60, H - 60, { width: 84, align: 'center' });
    doc.fillColor('#9DB2D6').fontSize(9)
       .text(`Codigo: ${codigo}`, 160, H - 120)
       .text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 160, H - 104)
       .text('SESI - Servico Social da Industria', 160, H - 88);

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { codigo, arquivoPath, arquivoUrl };
}

async function gerarRelatorioRespostas({ nome, nivelMaturidade, respostas, baseUrl }) {
  const arquivoNome = `respostas-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.pdf`;
  const arquivoPath = path.join(OUT_DIR, arquivoNome);
  const arquivoUrl = `/uploads/certificados/${arquivoNome}`;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const stream = fs.createWriteStream(arquivoPath);
    doc.pipe(stream);
    const W = doc.page.width;

    if (existe(ASSET_LOGO)) {
      doc.roundedRect(48, 40, 150, 48, 6).fill('#06101F');
      doc.image(ASSET_LOGO, 58, 50, { fit: [130, 28] });
    }
    doc.fillColor('#0A4FA0').fontSize(16).font('Helvetica-Bold')
       .text('Relatorio de Respostas', 210, 46, { align: 'right' });
    doc.fillColor('#5BA829').fontSize(10).font('Helvetica')
       .text('Assedio em Cena - SESI', 210, 68, { align: 'right' });
    doc.moveTo(48, 100).lineTo(W - 48, 100).strokeColor('#DDE3EC').stroke();

    let y = 116;
    const NIVEL = { observador: 'Observador Inicial', agente: 'Agente Consciente', guardiao: 'Guardiao do Respeito' };
    doc.fillColor('#111').fontSize(12).font('Helvetica-Bold').text('Participante:', 48, y);
    doc.font('Helvetica').text(nome, 150, y); y += 18;
    doc.font('Helvetica-Bold').text('Nivel alcancado:', 48, y);
    doc.font('Helvetica').text(NIVEL[nivelMaturidade] || nivelMaturidade, 150, y); y += 18;
    doc.font('Helvetica-Bold').text('Emitido em:', 48, y);
    doc.font('Helvetica').text(new Date().toLocaleString('pt-BR'), 150, y); y += 14;

    const acertos = respostas.filter((r) => r.correta === 1).length;
    const avaliadas = respostas.filter((r) => r.correta === 0 || r.correta === 1).length;
    doc.font('Helvetica-Bold').text('Acertos:', 48, y + 6);
    doc.font('Helvetica').text(`${acertos} de ${avaliadas} questoes avaliadas`, 150, y + 6); y += 36;

    respostas.forEach((r, i) => {
      if (y > 720) { doc.addPage(); y = 60; }
      const marca = r.correta === 1 ? '[OK]' : r.correta === 0 ? '[X]' : '-';
      const cor = r.correta === 1 ? '#1E7A2E' : r.correta === 0 ? '#B3261E' : '#0A4FA0';
      doc.fillColor('#0A4FA0').fontSize(11).font('Helvetica-Bold')
         .text(`${i + 1}. ${r.cenario_titulo || 'Situacao'}  [${r.cenario_tipo || ''}]`, 48, y, { width: W - 96 });
      y = doc.y + 2;
      if (r.pergunta) {
        doc.fillColor('#444').fontSize(9.5).font('Helvetica').text(r.pergunta, 48, y, { width: W - 96 });
        y = doc.y + 2;
      }
      doc.fillColor(cor).fontSize(10).font('Helvetica-Bold')
         .text(`${marca} ${r.resposta_texto || '-'}`, 60, y, { width: W - 108 });
      y = doc.y + 6;
      doc.moveTo(48, y).lineTo(W - 48, y).strokeColor('#EEE').stroke(); y += 8;
    });

    doc.fillColor('#888').fontSize(8).font('Helvetica')
       .text('Documento gerado automaticamente pela plataforma Assedio em Cena - SESI.', 48, 800, { align: 'center', width: W - 96 });
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { arquivoPath, arquivoUrl };
}

module.exports = { gerarCertificado, gerarRelatorioRespostas, gerarCodigo };
