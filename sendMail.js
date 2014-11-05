var path = require('path');

var exec = require('child_process').exec;
var nodemailer = require('nodemailer');

var util = require('./util');

var sender = 'user@gmail.com';
var pass = 'pass';
var receiver = "foo@bar.com";

var localConfig = util.requireIfExits(path.resolve(__dirname, './localConfig'));
// console.log(localConfig)
if(localConfig.exists){
    sender = localConfig.m.sender;
    pass = localConfig.m.pass;
    receiver = localConfig.m.receiver;
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: sender,
        pass: pass
    }
});

var mailConfig = {
    from: sender,
    to: receiver
};

var param = util.getCmdParam();

function sendDeployResult(){
    var mail = util.shallowExtend({}, mailConfig);
    // 部署结果为1时 表示成功, 这点和shell执行的process exit code不一样
    if(param.result == 1){
        mail.subject = 'Deploy succeed!';

        // 附加git log
        exec('git log -2', function(err, data){
            if(err){
                mail.text = 'failed to get git log...';
            }
            else{
                mail.text = 'here is the last to commit: \n';
                mail.text += data;
            }
            mail.text += '\nclean result: ' + ((param.cleanRes == 0)? 'done~' : 'errored.. : '+param.cleanRes);

            transporter.sendMail(mail);
        });
    }
    else{
        mail.subject = 'Deploy failed...';
        mail.text = param.msg + '\n';
        mail.text += 'cleaner exec result: ' + ((param.cleanRes == 0)? 'done~' : 'errored.. : '+param.cleanRes);

        transporter.sendMail(mail);
    }
}

console.log('sending email: \n\tfrom: ', sender , '\n\tto: ',receiver, '\n\tresult: ', param.result );
sendDeployResult();