'use strict';

var express = require('express');
var nodemailer = require('nodemailer');
var app = express();
var port = 80;

app.use(express.static(__dirname + '/public'));

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'keegan.lee.francis@gmail.com',
        pass: 'P14n0M4n'
    }
});

app.post('/send', function(req, res) {
    var mailOptions = {
        to: 'keegan.lee.francis@gmail.com',
        subject: req.query.subject,
        html: `
            <html>
            <body>
                <h1 style='text-align:center'>You got a message!</h1>

                <p style='margin-top: 20px;font-size: 1.2em;font-weight: bold;' id='email'>From: <span style='font-size:1em;font-weight:normal;'>${req.query.email}</span></p>

                <p style='margin-top: 20px;font-size: 1.2em;font-weight: bold;' id='message'>Message: <span style='font-size:1em;font-weight:normal'>${req.query.message}</span></p>
            </body>
            </html>
        `
    };
    transporter.sendMail(mailOptions, function(error, response) {
        if (error) {
            res.send({
                'success': false,
                'message': 'Internal Server Error : ' + error
            });
        } else {
            res.send({
                'success': true,
                'message': 'We have received your message!'
            })
         }
    });
});

app.listen(port, function() {
    console.log("App started on port : " + port);
});
