import * as nodemailer from 'nodemailer';

export function createTransporter(): nodemailer.Transporter {
    const host = process.env.MAIL_HOST;
    const port = parseInt(process.env.MAIL_PORT || '587');
    const username = process.env.MAIL_USERNAME;
    const password = process.env.MAIL_PASS;

    if (!host) {
        throw new Error('MAIL_HOST environment variable is not set');
    }
    if (!username) {
        throw new Error('MAIL_USERNAME environment variable is not set');
    }
    if (!password) {
        throw new Error('MAIL_PASS environment variable is not set');
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password,
        }
    });
    return transporter;
}
