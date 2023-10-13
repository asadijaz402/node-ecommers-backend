const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "asadsulehery402@gmail.com",
      pass: "ablrdgvddrpfxvln",
    },
  });
  const mailOption = {
    from: process.env.SMPT_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
