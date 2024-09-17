/*const nodemailer =( 'nodemailer');

const Email = (options) => {
  let transpoter = nodemailer.createTransport({
    service: 'gmail', 
    auther: {
      user: 'gytgutu@gmail.com', 
      pass: 'tkxyciudxhzppbkl', 
    },
  });
  transpoter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }else{
      console.log("email sent ");
      res.status(201).json({status:201,info})
    }
  });
};

 const EmailSender = ({ email }) => {
  const options = {
    from: user,
      to: email,
      subject: "Veuillez activer votre compte ",
      html: `
      <div>
      <h1>Activation du compte </h1>
        <h2>Bonjour </h2>
        <p>Veuillez confirmer votre email en cliquant sur le lien suivant
        <a href=http://localhost:3000/Login>Cliquez ici</a>                              
        </div>`,
  };
  Email(options)
};

module.exports=EmailSender*/