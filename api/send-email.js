const nodemailer = require('nodemailer');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'patljoy8@gmail.com',
                pass: 'btae nulb iaun pbgc'
            }
        });

        const mailOptionsToAgency = {
            from: email,
            to: 'patljoy8@gmail.com',
            subject: `Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        const mailOptionsToUser = {
            from: 'patljoy8@gmail.com',
            to: email,
            subject: `Welcome to MetaArt, ${name}`,
            text: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nMetaArt Team`
        };

        transporter.sendMail(mailOptionsToAgency, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Error sending email: ' + error.message });
            }
            transporter.sendMail(mailOptionsToUser, (error, info) => {
                if (error) {
                    return res.status(500).json({ error: 'Error sending confirmation email: ' + error.message });
                }
                res.status(200).json({ message: 'Email sent successfully!' });
            });
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}