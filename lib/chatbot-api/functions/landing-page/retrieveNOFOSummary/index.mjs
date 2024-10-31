import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  console.log("Starting Lambda function to retrieve JSON file");
  console.log("file: ", event.queryStringParameters.documentKey);

  const s3Bucket = process.env.BUCKET; // Ensure BUCKET is set in environment variables
  const s3Client = new S3Client();

  try {
    // Get the filename/key from the event parameter
    const fileName  = event.queryStringParameters.documentKey;
    if (!fileName) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: "Missing 'fileName' in request body" }),
      };
    }

    // Retrieve the JSON file from S3
    const command = new GetObjectCommand({
      Bucket: s3Bucket,
      Key: fileName,
    });

    const result = await s3Client.send(command);
    console.log("Received file from S3:", fileName);

    // Convert the file's data stream to a string
    const fileContent = await streamToString(result.Body);

    // Return the content of the JSON file
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: "File retrieved successfully",
        data: JSON.parse(fileContent),
      }),
    };

  } catch (error) {
    console.error("Error fetching file from S3:", error);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Failed to retrieve file from S3. Internal Server Error.',
      }),
    };
  }
};
// Helper function to convert stream data to a string
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};
