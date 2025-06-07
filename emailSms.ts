// @ts-ignore
import nodemailer from "nodemailer";

export type SmtpConfig = {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
};

/**
 * Sends an SMS via the Xfinity Mobile email-to-SMS gateway.
 * @param smtpConfig SMTP configuration for nodemailer
 * @param phoneNumber The recipient's 10-digit phone number (e.g., "8015551234")
 * @param message The message to send (max 160 chars recommended)
 */
export async function sendSmsViaEmail(
    appPassword: string,
    phoneNumber: string,
    message: string
): Promise<void> {
    const smtpConfig = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "dallin.frandsen@gmail.com",
            pass: appPassword,
        },
    };
    const smsAddress = `${phoneNumber}@vtext.com`; // Xfinity Mobile uses Verizon's gateway
    // const mmsAddress = `${phoneNumber}@vzwpix.com`; // Xfinity Mobile MMS gateway
    const transporter = nodemailer.createTransport(smtpConfig);
    await transporter.sendMail({
        from: smtpConfig.auth.user,
        to: smsAddress,
        subject: "",
        text: message,
    });
}
