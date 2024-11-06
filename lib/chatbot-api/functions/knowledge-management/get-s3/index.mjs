// Import necessary modules
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  console.log("Starting Lambda function");
  const s3Client = new S3Client();
  
  // const folderPrefix = event.queryStringParameters?.documentIdentifier || ''; 
  const body = JSON.parse(event.body);
  const folderPrefix = body.folderPrefix || '';

  console.log("folderPrefix received:", folderPrefix); // Debugging log

  try {
    const claims = event.requestContext.authorizer.jwt.claims
    const roles = JSON.parse(claims['custom:role'])
    console.log(roles)
    if (roles.includes("Admin")) {
      console.log("authorized")      
    } else {
      console.log("not an admin")
      return {
        statusCode: 403,
         headers: {
              'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({message: 'User is not authorized to perform this action'}),
      };
    }
  } catch (e) {
    console.log("could not check admin access")
    return {
      statusCode: 500,
       headers: {
            'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Unable to check user role, please ensure you have Cognito configured correctly with a custom:role attribute.'}),
    };
  }
  const {continuationToken, pageIndex } = event;
  const s3Bucket = process.env.BUCKET;
  
  try {
    console.log("trying with folder prefix:", folderPrefix); // Debugging log
    const command = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: folderPrefix + "/",
      Delimiter: '/',
      ContinuationToken: continuationToken,
    });

    const result = await s3Client.send(command);
    console.log("S3 Result:", result);

    
    return {
      statusCode: 200,
      headers: {
            'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
       headers: {
            'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Get S3 Bucket data failed- Internal Server Error'}),
    };
  }
};
