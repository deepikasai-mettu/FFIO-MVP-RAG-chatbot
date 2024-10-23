const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.handler = async (event) => {
  const { documentKey } = JSON.parse(event.body);
  const s3Bucket = process.env.DOCUMENTS_BUCKET;

  try {
    // Read the document from S3
    const s3Object = await S3.getObject({
      Bucket: s3Bucket,
      Key: documentKey,
    }).promise();

    const documentContent = s3Object.Body.toString('utf-8');

    // Proceed to summarize the document (Task 2)

  } catch (error) {
    console.error('Error processing document:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing document' }),
    };
  }
};
