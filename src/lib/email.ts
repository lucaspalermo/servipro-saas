import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@servipro.com.br";
const APP_NAME = "ServiPro";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="text-align:center;padding:24px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);padding:10px 20px;border-radius:12px;">
        <span style="color:#fff;font-size:20px;font-weight:bold;">${APP_NAME}</span>
      </div>
    </div>
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;color:#e2e8f0;">
      ${content}
    </div>
    <div style="text-align:center;padding:24px 0;color:#64748b;font-size:12px;">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
      <p>Este email foi enviado automaticamente. Nao responda diretamente.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] SMTP nao configurado. Assunto: ${subject} | Para: ${to}`);
    return { success: false, reason: "SMTP nao configurado" };
  }

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email] Erro ao enviar:", error);
    return { success: false, reason: String(error) };
  }
}

export async function sendTrialEndingEmail(to: string, nome: string, diasRestantes: number) {
  const subject = `${APP_NAME}: Seu trial termina em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`;
  const html = baseTemplate(`
    <h2 style="color:#fff;margin:0 0 16px;">Ola, ${nome}!</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      Seu periodo de teste gratuito do ${APP_NAME} termina em
      <strong style="color:#f59e0b;">${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}</strong>.
    </p>
    <p style="margin:0 0 24px;line-height:1.6;">
      Para nao perder acesso ao sistema, agendamentos e dados da sua empresa,
      escolha um plano e continue usando todas as funcionalidades.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://servipro.com.br"}/dashboard/configuracoes"
         style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:16px;">
        Escolher meu Plano
      </a>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      Precisa de ajuda? Fale conosco pelo WhatsApp ou responda este email.
    </p>
  `);
  return sendEmail(to, subject, html);
}

export async function sendServiceExpiringEmail(
  to: string,
  nomeCliente: string,
  nomeEmpresa: string,
  servico: string,
  dataVencimento: string
) {
  const subject = `Servico vencendo: ${servico} - ${nomeCliente}`;
  const html = baseTemplate(`
    <h2 style="color:#fff;margin:0 0 16px;">Atencao, ${nomeEmpresa}!</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      O servico abaixo esta proximo do vencimento:
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Cliente:</strong> <span style="color:#fff;">${nomeCliente}</span></p>
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Servico:</strong> <span style="color:#fff;">${servico}</span></p>
      <p style="margin:0;"><strong style="color:#94a3b8;">Vencimento:</strong> <span style="color:#f59e0b;font-weight:bold;">${dataVencimento}</span></p>
    </div>
    <p style="margin:0 0 24px;line-height:1.6;">
      Acesse o sistema para reagendar ou gerar uma nova ordem de servico.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://servipro.com.br"}/dashboard/agenda"
         style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;">
        Ver Agenda
      </a>
    </div>
  `);
  return sendEmail(to, subject, html);
}

export async function sendPaymentOverdueEmail(
  to: string,
  nomeEmpresa: string,
  descricao: string,
  valor: string,
  dataVencimento: string
) {
  const subject = `Cobranca atrasada: ${descricao}`;
  const html = baseTemplate(`
    <h2 style="color:#fff;margin:0 0 16px;">Ola, ${nomeEmpresa}!</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      Voce tem uma cobranca em atraso:
    </p>
    <div style="background:#0f172a;border:1px solid #dc2626;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Descricao:</strong> <span style="color:#fff;">${descricao}</span></p>
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Valor:</strong> <span style="color:#ef4444;font-weight:bold;">${valor}</span></p>
      <p style="margin:0;"><strong style="color:#94a3b8;">Vencimento:</strong> <span style="color:#ef4444;">${dataVencimento}</span></p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://servipro.com.br"}/dashboard/financeiro"
         style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;">
        Ver Financeiro
      </a>
    </div>
  `);
  return sendEmail(to, subject, html);
}

export async function sendWelcomeEmail(to: string, nome: string) {
  const subject = `Bem-vindo ao ${APP_NAME}!`;
  const html = baseTemplate(`
    <h2 style="color:#fff;margin:0 0 16px;">Bem-vindo ao ${APP_NAME}, ${nome}!</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      Sua conta foi criada com sucesso. Voce tem <strong style="color:#10b981;">14 dias gratuitos</strong>
      para testar todas as funcionalidades.
    </p>
    <p style="margin:0 0 8px;font-weight:bold;color:#fff;">Proximos passos:</p>
    <ul style="margin:0 0 24px;padding-left:20px;line-height:2;">
      <li>Configure os dados da sua empresa</li>
      <li>Cadastre seus tecnicos e clientes</li>
      <li>Crie seu primeiro servico e agendamento</li>
      <li>Ative os lembretes automaticos por WhatsApp</li>
    </ul>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://servipro.com.br"}/dashboard/onboarding"
         style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:16px;">
        Completar Cadastro
      </a>
    </div>
  `);
  return sendEmail(to, subject, html);
}

export async function sendScheduleConfirmationEmail(
  to: string,
  nomeCliente: string,
  nomeEmpresa: string,
  servico: string,
  data: string,
  hora: string
) {
  const subject = `Agendamento confirmado - ${nomeEmpresa}`;
  const html = baseTemplate(`
    <h2 style="color:#fff;margin:0 0 16px;">Ola, ${nomeCliente}!</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      Seu agendamento foi confirmado:
    </p>
    <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Empresa:</strong> <span style="color:#fff;">${nomeEmpresa}</span></p>
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Servico:</strong> <span style="color:#fff;">${servico}</span></p>
      <p style="margin:0 0 8px;"><strong style="color:#94a3b8;">Data:</strong> <span style="color:#10b981;font-weight:bold;">${data}</span></p>
      <p style="margin:0;"><strong style="color:#94a3b8;">Horario:</strong> <span style="color:#10b981;font-weight:bold;">${hora}</span></p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      Em caso de duvidas, entre em contato com ${nomeEmpresa}.
    </p>
  `);
  return sendEmail(to, subject, html);
}
