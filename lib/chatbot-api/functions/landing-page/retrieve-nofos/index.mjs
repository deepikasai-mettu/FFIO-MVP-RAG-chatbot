import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  console.log("Starting Lambda function");

  const s3Bucket = process.env.BUCKET; 
  const s3Client = new S3Client();

  try {
    // listing objects in the S3 bucket with pagination
    const command = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Delimiter: '/'
    });

    const result = await s3Client.send(command);
    console.log("Received result from S3:", result);

    // Return the S3 result with a successful status
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', 
      },
      body: JSON.stringify(result), 
    };

  } catch (error) {
    console.error("Error fetching data from S3:", error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Failed to retrieve data from S3. Internal Server Error.',
      }),
    };
  }
};
