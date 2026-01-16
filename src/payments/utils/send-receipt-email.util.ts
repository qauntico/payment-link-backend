import { createTransporter } from './send-mail-transporter.util';
import { paymentReceiptTemplate } from './mail-templates.util';

interface SendReceiptEmailParams {
  customerEmail: string;
  customerName: string;
  productTitle: string;
  amount: string;
  currency: string;
  receiptUrl: string;
  merchantName: string;
  subject?: string;
}

export async function sendReceiptEmail(
  params: SendReceiptEmailParams,
): Promise<void> {
  try {
    const {
      customerEmail,
      customerName,
      productTitle,
      amount,
      currency,
      receiptUrl,
      merchantName,
      subject = 'Payment Confirmation - Receipt Available',
    } = params;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${process.env.MAIL_HOST?.split('.')[0] || 'marketplace'}.com`,
      to: customerEmail,
      subject: subject,
      html: paymentReceiptTemplate(
        customerName,
        productTitle,
        amount,
        currency,
        receiptUrl,
        merchantName,
      ),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Receipt email successfully sent:', info.messageId);
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
}
