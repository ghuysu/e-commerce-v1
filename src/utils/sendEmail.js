const nodeMailer = require("nodemailer");
const brycpt = require("bcryptjs");

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremail',
        pass: 'yourpass',
    }
});

module.exports = async function(targetEmail, subject = "Authentication Code", useFor){
    const code = Math.floor(100000 + Math.random() * 900000);
    const hashedCode = await brycpt.hash(code.toString(), 12);
    const dbCode = new Code({
        hashedContent: hashedCode,
        userEmail: req.body.email,
        type: "create-store",
        date: new Date()
    });
    await dbCode.save();

    await transporter.sendMail({
        from: 'daogiahuysu@gmail.com',
        to: targetEmail,
        subject: subject,
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Authentication Code</h2>
            <p style="font-size: 16px;">You are receiving this email because you requested an authentication code for ${useFor}.</p>
            <p style="font-size: 24px; font-weight: bold; color: #ccc;">${code}</p>
            <p style="font-size: 16px;">Enter this code to verify your identity and complete the ${useFor} process.</p>
        </div>`
    })

    return code;
}   
