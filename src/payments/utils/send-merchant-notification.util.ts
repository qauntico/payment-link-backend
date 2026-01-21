import { createTransporter } from './send-mail-transporter.util';
import { merchantPaymentNotificationTemplate } from './mail-templates.util';

interface SendMerchantNotificationParams {
  merchantEmail: string;
  merchantName: string;
  productTitle: string;
  customerName: string;
  amount: string;
  currency: string;
  receiptUrl: string;
  subject?: string;
}

export async function sendMerchantNotification(
  params: SendMerchantNotificationParams,
): Promise<void> {
  try {
    const {
      merchantEmail,
      merchantName,
      productTitle,
      customerName,
      amount,
      currency,
      receiptUrl,
      subject = 'New Payment Received - Payment Notification',
    } = params;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${process.env.MAIL_HOST?.split('.')[0] || 'marketplace'}.com`,
      to: merchantEmail,
      subject: subject,
      html: merchantPaymentNotificationTemplate(
        merchantName,
        productTitle,
        customerName,
        amount,
        currency,
        receiptUrl,
      ),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Merchant notification email successfully sent:', info.messageId);
  } catch (error) {
    console.error('Error sending merchant notification email:', error);
  }
}
