import nodemailer from 'nodemailer';

export async function sendResetEmail(toEmail) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'amirmes@post.bgu.ac.il',
                pass: 'hpjyaxgebjmwsmxa'
            }
        });

        const mailOptions = {
            from: '"DogPlay Support" <amirmes@post.bgu.ac.il>',
            to: toEmail,
            subject: 'Password Reset - DogPlay',
            text: `Hi! Here's your password reset link: http://localhost:8080/login.html?reset=${toEmail}`,
            html: `<p>Hi! Click <a href="http://localhost:8080/login.html?reset=${toEmail}">here</a> to reset your password.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Reset email sent to", toEmail);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
