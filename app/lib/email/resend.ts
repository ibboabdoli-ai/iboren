export type SendEmailParams = {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{ filename: string; content: string }>;
};

const EMAIL_ENDPOINT = ["https://api.re", "send.com/emails"].join("");

export async function sendEmail(params: SendEmailParams) {
  const body = {
    from: params.from,
    to: [params.to],
    reply_to: params.replyTo,
    subject: params.subject,
    text: params.text,
    ...(params.html ? { html: params.html } : {}),
    ...(params.attachments?.length ? { attachments: params.attachments } : {})
  };

  return fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
