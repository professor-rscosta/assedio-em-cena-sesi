const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null; // e-mail não configurado
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function enviarEmail({ para, assunto, html, anexos = [] }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[email] SMTP não configurado — e-mail para ${para} não enviado (assunto: ${assunto}).`);
    return { enviado: false, motivo: 'smtp_nao_configurado' };
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || 'Assédio em Cena <no-reply@local>',
    to: para,
    subject: assunto,
    html,
    attachments: anexos,
  });
  return { enviado: true };
}

async function notificarCertificado({ para, nome, codigo, baseUrl }) {
  const html = `
    <div style="font-family:Arial,sans-serif;background:#0B1020;color:#fff;padding:32px;border-radius:12px">
      <h2 style="color:#7C5CFF">Parabéns, ${nome}!</h2>
      <p style="color:#CBD5E1">Você concluiu um módulo do programa <b>Assédio em Cena</b> e seu certificado foi emitido.</p>
      <p style="color:#CBD5E1">Código de validação: <b style="color:#22C55E">${codigo}</b></p>
      <a href="${baseUrl}/validar/${codigo}"
         style="display:inline-block;margin-top:12px;background:#7C5CFF;color:#fff;
                padding:12px 20px;border-radius:8px;text-decoration:none">Validar certificado</a>
    </div>`;
  return enviarEmail({ para, assunto: 'Seu certificado — Assédio em Cena', html });
}

module.exports = { enviarEmail, notificarCertificado };
