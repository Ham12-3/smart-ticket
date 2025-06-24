import nodemailer from "nodemailer"

export const sendMail = async(to, subject, text) => {
    try {
const transporter = nodemailer.createTransporter({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
    }
})

const info = await transporter.sendMail({
    from: '"Smart Ticket System" <noreply@smartticket.com>',
    to,
    subject,
    text,
    
})

console.log("Message sent:", info.messageId)
return info
    } catch(err) {
console.error("Error sending email: ", err.message)

throw err
    }
}