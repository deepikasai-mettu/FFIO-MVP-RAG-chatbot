import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client();
const bucketName = "ffio-nofos-bucket";

export async function getNOFOListFromS3Take2() {
    
    console.log("calling retrive function: getNOFOListFromS3Take2");

    try {
        const response = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
        const nofoList = response.Contents?.filter(item => item.Key?.endsWith('.pdf') || item.Key?.endsWith('.docx')).map(item => ({
            name: item.Key,
            url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`
        }));
        console.log("found nofos");
        
        return nofoList || [];
    } catch (error) {
        console.error('Error fetching NOFO list:', error);
        return [];
    }
  }

(async () => {
    const nofos = await getNOFOListFromS3Take2();
    console.log("NOFOs:", nofos);
})();