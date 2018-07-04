console.log('Loading event');
var AWS = require('aws-sdk');
var request = require('request-promise').defaults({ encoding: null });
var moment = require('moment');
var s3 = new AWS.S3();

const QR_URL = 'http://api.qrserver.com/v1/create-qr-code/';
const QR_BUCKET = 'qr-codes-bucket';

exports.handler = function(event, context) {
    let qrUrl = QR_URL;
    let email = event.email;

    const d = new Date();
    d.setHours(d.getHours() - 5);
    const todaysDateId = moment(d.toISOString()).format("MM-DD-YYYY");

    let key = todaysDateId + '_' + email + '.png';
    qrUrl += '?data=' + key + '!&size=100x100';
    console.log(qrUrl);
    const qrCodeRequest = request.get(qrUrl, {followRedirect: false});

    return qrCodeRequest.then((img) => {

        const buffer = Buffer.from(img, 'base64');
        var data = {
            Bucket: QR_BUCKET, 
            Key: key, 
            Body: buffer,
            ContentType: 'image/png',
            ACL: 'public-read'
          };
        const putObject = s3.putObject(data).promise();

        return putObject.then((data, err) => {
            if(err) console.err(err);
            return key;
        });
    });
};
