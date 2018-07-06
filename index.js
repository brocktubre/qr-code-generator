console.log('Loading event');
var AWS = require('aws-sdk');
var request = require('request-promise').defaults({ encoding: null });
var moment = require('moment');
var s3 = new AWS.S3();
const SES = new AWS.SES({apiVersion: '2010-12-01'});

const QR_URL = 'http://api.qrserver.com/v1/create-qr-code/';
const QR_BUCKET = 'qr-codes-bucket';

exports.handler = function(event, context) {
    const d = new Date();
    d.setHours(d.getHours() - 5);
    const todaysDateId = moment(d.toISOString()).format("MM-DD-YYYY");


    event.students.forEach(item => {
        let key = todaysDateId + '_' + item.student_id + '.png';
        let qrUrl = QR_URL;
        qrUrl += '?data=' + key + '!&size=500x500';
        console.log(qrUrl);
        const qrCodeRequest = request.get(qrUrl, {followRedirect: false});

        return qrCodeRequest.then((img) => {
                const buffer = Buffer.from(img, 'base64');
                var data = {
                    Bucket: QR_BUCKET, 
                    Key: key, 
                    Body: buffer,
                    ContentType: 'image/png',
                    ACL: 'public-read',
                    Metadata: {
                        'students_first_name' : item.first_name,
                        'students_last_name': item.last_name,
                        'students_id': item.student_id,
                        'students_email': item.email
                    }
                };
                const putObject = s3.putObject(data).promise();

                return putObject.then((data, err) => {
                    if(err) console.err(err);
                    else {
                        return key;
                    }
                });
            });
        });
};
