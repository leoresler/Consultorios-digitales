import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsappSender {
  sendOtp(telefono: string, codigo: string): Promise<void>;
}

@Injectable()
export class WhatsappCloudProvider implements WhatsappSender {
  private readonly logger = new Logger(WhatsappCloudProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(telefono: string, codigo: string): Promise<void> {
    const token = this.configService.get<string>('WHATSAPP_TOKEN');
    const phoneId = this.configService.get<string>('WHATSAPP_PHONE_ID');

    if (!token || !phoneId) {
      this.logger.warn(
        `WHATSAPP_TOKEN/WHATSAPP_PHONE_ID no configurados. ` +
          `[DEV] OTP para ${telefono}: ${codigo}`,
      );
      return;
    }

    const templateName =
      this.configService.get<string>('WHATSAPP_TEMPLATE_NAME') ?? 'otp';

    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: telefono,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_AR' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: codigo }],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Error enviando OTP por WhatsApp (${response.status}): ${body}`,
      );
    }
  }
}