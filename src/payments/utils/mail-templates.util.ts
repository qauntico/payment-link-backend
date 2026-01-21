/**
 * Email template for payment receipt confirmation
 * @param customerName - Name of the customer
 * @param productTitle - Title of the purchased product
 * @param amount - Amount paid
 * @param currency - Currency code (e.g., XAF, USD)
 * @param receiptUrl - URL to download the receipt PDF
 * @param merchantName - Name of the merchant/business
 * @returns HTML email template string
 */
export function paymentReceiptTemplate(
  customerName: string,
  productTitle: string,
  amount: string,
  currency: string,
  receiptUrl: string,
  merchantName: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .receipt-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
        .success-icon {
          text-align: center;
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Payment Confirmed!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>Thank you for your purchase! Your payment has been successfully processed.</p>
          
          <div class="info-row">
            <span class="info-label">Product:</span>
            <span class="info-value">${productTitle}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Amount Paid:</span>
            <span class="info-value">${amount} ${currency}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Merchant:</span>
            <span class="info-value">${merchantName}</span>
          </div>
          
          <p style="margin-top: 30px;">Your receipt is ready for download. Please click the button below to access it:</p>
          
          <div style="text-align: center;">
            <a href="${receiptUrl}" class="receipt-button" target="_blank">Download Receipt</a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions or concerns about your purchase, please contact the merchant directly.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} ${merchantName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for merchant payment notification
 * @param merchantName - Name of the merchant/business
 * @param productTitle - Title of the purchased product
 * @param customerName - Name of the customer
 * @param amount - Amount paid
 * @param currency - Currency code (e.g., XAF, USD)
 * @param receiptUrl - URL to download the receipt PDF
 * @returns HTML email template string
 */
export function merchantPaymentNotificationTemplate(
  merchantName: string,
  productTitle: string,
  customerName: string,
  amount: string,
  currency: string,
  receiptUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Received</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2196F3;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .amount-highlight {
          background-color: #E3F2FD;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
        }
        .amount-value {
          font-size: 24px;
          font-weight: bold;
          color: #2196F3;
        }
        .receipt-button {
          display: inline-block;
          background-color: #2196F3;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
        .notification-icon {
          text-align: center;
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="notification-icon">💰</div>
          <h1>New Payment Received!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${merchantName},</p>
          
          <p>Great news! You have received a new payment for one of your products.</p>
          
          <div class="amount-highlight">
            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">Amount Received</div>
            <div class="amount-value">${amount} ${currency}</div>
          </div>
          
          <div class="info-row">
            <span class="info-label">Product:</span>
            <span class="info-value">${productTitle}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Customer Name:</span>
            <span class="info-value">${customerName}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Payment Date:</span>
            <span class="info-value">${new Date().toLocaleDateString()}</span>
          </div>
          
          <p style="margin-top: 30px;">A receipt has been generated for this transaction. You can view it by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${receiptUrl}" class="receipt-button" target="_blank">View Receipt</a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This payment has been automatically recorded in your account. You can view all your transactions in your merchant dashboard.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Payment Link Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
