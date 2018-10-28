var AWS = require('aws-sdk');

var s3 = new AWS.S3();


const checkBucketExists = async (bucket) => {
  const options = {
    Bucket: bucket,
  };
  try {
    await s3.headBucket(options).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
    console.log(error);
    throw error;
  }
};

exports.addToNew = tweets => new Promise((resolve, reject) => {
  console.log('inside function');
  if (checkBucketExists('ntgb1111')) {
    console.log('exists');
    const params = { Bucket: 'ntgb1111', Key: 'tweets.txt', Body: 'nice' };
    s3.putObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      console.log(data);
      console.log("Successfully uploaded data to myBucket/myKey");
      return resolve(tweets);
    });
  } else {
    console.log('error no bucket');
    return reject(new Error('no bucket'));
  }
});
