var nodemailer = require('nodemailer');

var util = require('./util');

var sender = 'user@gmail.com';
var pass = 'pass';
var receiver = "foo@bar.com";

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: sender,
        pass: pass
    }
});
transporter.sendMail({
    from: sender,
    to: 'chenllos@163.com',
    subject: 'hello',
    text: 'hello world!'
});

var mailConfig = {
    from: sender,
    to: receiver
};

function sendDeployResult(){
    var param = util.getCmdParam();
    var mail = util.shallowExtend({}, mailConfig);
    if(param.result == 1){
        mail.subject = 'Deploy succeed!';
        mail.text = '';
    }
    else{
        mail.subject = 'Deploy failed...';
        mail.text = param.msg;

        transporter.sendMail(mail);
    }
}