export interface MailerSendOptions {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface Mailer {
  sendMail(options: MailerSendOptions): Promise<void>;
}