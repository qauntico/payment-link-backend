import PDFDocument from 'pdfkit';
import { Payment, Product, User } from 'src/generated/prisma/client';


interface ReceiptData {
  payment: Payment & {
    product?: (Product & {
      merchant?: User;
    }) | null;
  };
}

export async function generateReceiptPdf(
  receiptData: ReceiptData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const { payment } = receiptData;
      const product = payment.product;
      const merchant = product?.merchant;

      // Title
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Payment Receipt', { align: 'center' })
        .moveDown(1);

      // Merchant Name
      if (merchant?.businessName) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Merchant:', { continued: true })
          .font('Helvetica')
          .text(` ${merchant.businessName}`)
          .moveDown(0.5);
      }

      // Product Title
      if (product?.title) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Product:', { continued: true })
          .font('Helvetica')
          .text(` ${product.title}`)
          .moveDown(0.5);
      }

      // Description
      if (product?.description) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Description:', { continued: true })
          .font('Helvetica')
          .text(` ${product.description}`)
          .moveDown(0.5);
      }

      // Amount Paid
      if (payment.amount) {
        const amount = Number(payment.amount);
        const currency = payment.currencyCode || 'XAF';
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Amount Paid:', { continued: true })
          .font('Helvetica')
          .text(` ${amount.toFixed(2)} ${currency}`)
          .moveDown(0.5);
      }

      // Payment Reference
      if (payment.externalReference) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Payment Reference:', { continued: true })
          .font('Helvetica')
          .text(` ${payment.externalReference}`)
          .moveDown(0.5);
      }

      // Customer Name & Email
      if (payment.customerName || payment.customerEmail) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Customer:', { continued: true })
          .font('Helvetica');
        
        if (payment.customerName && payment.customerEmail) {
          doc.text(` ${payment.customerName} (${payment.customerEmail})`);
        } else if (payment.customerName) {
          doc.text(` ${payment.customerName}`);
        } else if (payment.customerEmail) {
          doc.text(` ${payment.customerEmail}`);
        }
        doc.moveDown(0.5);
      }

      // Date of Payment
      if (payment.createdAt) {
        const paymentDate = new Date(payment.createdAt);
        const formattedDate = paymentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Date of Payment:', { continued: true })
          .font('Helvetica')
          .text(` ${formattedDate}`)
          .moveDown(1);
      }

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Thank you for your purchase!', { align: 'center' })
        .moveDown(0.5);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
