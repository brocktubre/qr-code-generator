console.log('Loading event');
var AWS = require('aws-sdk');
var request = require('request-promise').defaults({ encoding: null });
var moment = require('moment');
// var http = require('http');
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

    qrCodeRequest.then((img) => {

        const buffer = Buffer.from(img, 'base64');
        var data = {
            Bucket: QR_BUCKET, 
            Key: key, 
            Body: buffer,
            ContentType: 'image/png',
            ACL: 'public-read'
          };
          return s3.putObject(data, function(err, data){
              if (err) { 
                console.log(err);
                console.log('Error uploading data: ', data); 
              } else {
                console.log('Succesfully uploaded the image: ' + key);
              }
          });
    });

    // http.get(qrUrl, function(res) {
    //     var body = '';
    //     res.on('data', function(chunk) {
    //       // Agregates chunks
    //       body += chunk;
    //     });
    //     res.on('end', function() {
    //       // Once you received all chunks, send to S3
    //         var params = {
    //             Bucket: QR_BUCKET, 
    //             Key: key, 
    //             Body: body,
    //             ContentType: 'image/png',
    //             ACL: 'public-read'
    //             };
    //             return s3.putObject(params, function(err, data2){
    //                 if (err) { 
    //                 console.log(err);
    //                 console.log('Error uploading data: ', data2); 
    //                 } else {
    //                 console.log('Succesfully uploaded the image: ' + key);
    //                 }
    //             });
    //     });
    //   });

    
};
