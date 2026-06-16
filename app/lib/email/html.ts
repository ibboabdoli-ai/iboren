export type EmailLanguage = "sv" | "en";

export type EmailRow = {
  label: string;
  value: string | number | null | undefined;
};

export type EmailSection = {
  title?: string;
  lines: Array<string | null | undefined>;
};

export type EmailCta = {
  label: string;
  href: string;
};

export const EMAIL_LOGO_URL = "https://iboren.se/email/iboren-email-logo.png";
export const EMAIL_HERO_URL = "https://iboren.se/email/iboren-email-hero-cleaning.png";

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rowHtml(row: EmailRow) {
  const value = row.value === null || row.value === undefined || row.value === "" ? "-" : row.value;
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e3ebe5;color:#5e6b64;font-size:14px;line-height:20px;vertical-align:top;width:38%;">${escapeHtml(row.label)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e3ebe5;color:#173b2d;font-size:15px;line-height:22px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

function sectionHtml(section: EmailSection) {
  const lines = section.lines.map((line) => String(line ?? "").trim()).filter(Boolean);
  if (!lines.length) return "";
  return `
    <div style="margin:24px 0 0 0;padding:18px 20px;background:#f4f8f5;border:1px solid #dce8df;border-radius:18px;">
      ${section.title ? `<p style="margin:0 0 10px 0;color:#173b2d;font-size:15px;line-height:22px;font-weight:700;">${escapeHtml(section.title)}</p>` : ""}
      ${lines.map((line) => `<p style="margin:0 0 6px 0;color:#33443b;font-size:14px;line-height:21px;">${escapeHtml(line)}</p>`).join("")}
    </div>`;
}

export function brandedEmailLayout(params: {
  language: EmailLanguage;
  title: string;
  preheader: string;
  intro: string;
  nextStepTitle: string;
  nextStepText: string;
  rows: EmailRow[];
  sections?: EmailSection[];
  cta?: EmailCta;
  logoUrl?: string;
  heroImageUrl?: string;
  heroAlt?: string;
}) {
  const subheading = params.language === "en" ? "Cleaning in Södertälje & Stockholm" : "Städning i Södertälje & Stockholm";
  const summaryTitle = params.language === "en" ? "Your summary" : "Din sammanfattning";
  const footerText = params.language === "en" ? "Cleaning services in Södertälje and Stockholm" : "Städtjänster i Södertälje och Stockholm";
  const htmlLang = params.language === "en" ? "en" : "sv";
  const heroAlt = params.heroAlt || (params.language === "en" ? "Cleaning with Iboren" : "Städning med Iboren");
  const cta = params.cta || { href: "mailto:hej@iboren.se", label: params.language === "en" ? "Contact Iboren" : "Kontakta Iboren" };

  return `<!doctype html>
<html lang="${htmlLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ef;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(params.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ef;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dbe7df;">
            <tr>
              <td style="padding:28px 28px 22px 28px;background:#dfeae2;text-align:center;">
                <img src="${escapeHtml(params.logoUrl || EMAIL_LOGO_URL)}" width="180" alt="Iboren" style="display:block;width:180px;max-width:72%;height:auto;margin:0 auto 12px auto;border:0;">
                <div style="font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.14em;color:#456255;text-transform:uppercase;">${escapeHtml(subheading)}</div>
              </td>
            </tr>
            <tr>
              <td>
                <img src="${escapeHtml(params.heroImageUrl || EMAIL_HERO_URL)}" width="640" alt="${escapeHtml(heroAlt)}" style="display:block;width:100%;max-width:640px;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td style="padding:34px 28px 28px 28px;">
                <h1 style="margin:0 0 14px 0;color:#12372a;font-size:30px;line-height:36px;">${escapeHtml(params.title)}</h1>
                <p style="margin:0 0 22px 0;color:#26362f;font-size:17px;line-height:26px;">${escapeHtml(params.intro)}</p>

                <div style="padding:16px 18px;background:#f7faf7;border-left:4px solid #12372a;border-radius:14px;margin:0 0 24px 0;">
                  <p style="margin:0;color:#173b2d;font-size:15px;line-height:23px;font-weight:700;">${escapeHtml(params.nextStepTitle)}</p>
                  <p style="margin:6px 0 0 0;color:#33443b;font-size:15px;line-height:23px;">${escapeHtml(params.nextStepText)}</p>
                </div>

                <h2 style="margin:0 0 12px 0;color:#12372a;font-size:21px;line-height:28px;">${escapeHtml(summaryTitle)}</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  ${params.rows.map(rowHtml).join("")}
                </table>

                ${(params.sections || []).map(sectionHtml).join("")}

                <div style="margin:28px 0 0 0;text-align:center;">
                  <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#12372a;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-size:15px;line-height:20px;font-weight:700;">${escapeHtml(cta.label)}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;background:#dfeae2;text-align:center;">
                <p style="margin:0;color:#12372a;font-size:15px;line-height:22px;font-weight:700;">Iboren</p>
                <p style="margin:6px 0 0 0;color:#456255;font-size:13px;line-height:20px;">${escapeHtml(footerText)}</p>
                <p style="margin:10px 0 0 0;color:#456255;font-size:13px;line-height:20px;">hej@iboren.se · iboren.se</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function brandedTextEmail(params: {
  language: EmailLanguage;
  title: string;
  preheader: string;
  intro: string;
  nextStepTitle: string;
  nextStepText: string;
  text: string;
  cta?: EmailCta;
}) {
  const rows: EmailRow[] = [];
  const detailLines: string[] = [];

  params.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([^:]{2,44}):\s*(.+)$/);
      if (match) rows.push({ label: match[1], value: match[2] });
      else if (!line.startsWith("Hej ") && !line.startsWith("Hi ") && line !== "Iboren") detailLines.push(line);
    });

  return brandedEmailLayout({
    language: params.language,
    title: params.title,
    preheader: params.preheader,
    intro: params.intro,
    nextStepTitle: params.nextStepTitle,
    nextStepText: params.nextStepText,
    rows: rows.length ? rows : [{ label: params.language === "en" ? "Status" : "Status", value: params.nextStepText }],
    sections: detailLines.length ? [{ lines: detailLines.slice(0, 18) }] : undefined,
    cta: params.cta
  });
}
