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
      console.log('not exists');
      return false;
    }
    console.log(error);
    throw error;
  }
};

// Add to a new bucket, if exists just replace the contents,
// only in retrieve shall we retrieve //wrap this in promise?
exports.addToNew = (r, i) => new Promise((resolve, reject) => {
  async function blues(results, input) {
    console.log('inside function');
    console.log(input);
    console.log(results);
    if (await checkBucketExists('ntgb1111')) {
      console.log('exists');
      const params = { Bucket: 'ntgb1111', Key: `${input}.txt`, Body: JSON.stringify(results) };
      s3.putObject(params, (err, data) => {
        if (err) {
          console.log(err);
          return (err);
        }
        console.log(data);
        console.log('Successfully uploaded data to myBucket/myKey');
        return resolve(results);
      });
    } else {
      console.log('error no bucket');
      return reject(new Error('no bucket with that name found'));
    }
  }
  blues(r, i);
});
