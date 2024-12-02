import {
  GetObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand
} from '@aws-sdk/client-textract';
import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";
import {
  Upload
} from '@aws-sdk/lib-storage';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'

export const handler = async (event) => {
  console.log("1: Processing document from S3 and summarizing", event.Records);

  //const s3Bucket = process.env.BUCKET;
  const s3Client = new S3Client();
  const textractClient = new TextractClient({
      region: 'us-east-1'
  });
  const bedrockClient = new BedrockRuntimeClient();
  //const documentKey = event.queryStringParameters.documentKey;

  for (const record of event.Records){

  try {
      //const record = event.Records[0];
      console.log("1.5: Received record", record);
      const s3Bucket = record.s3.bucket.name;
      const documentKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      // Get specific object from S3
      const getObjectCommand = new GetObjectCommand({
          Bucket: s3Bucket,
          Key: documentKey,
      });
      const documentResult = await s3Client.send(getObjectCommand);
      console.log("2: Received document from S3", documentKey);

      let documentContent;
      if (documentKey.split('/').pop() == 'NOFO-File-PDF') {
          // Use AWS Textract for PDF content extraction
          console.log("Processing PDF file using AWS Textract");

          // Start Textract text detection on the PDF
          const startParams = {
              DocumentLocation: {
                  S3Object: {
                      Bucket: s3Bucket,
                      Name: documentKey,
                  },
              },
          };
          const startCommand = new StartDocumentTextDetectionCommand(startParams);
          const startResponse = await textractClient.send(startCommand);
          const jobId = startResponse.JobId;
          console.log(`Started Textract Job: ${jobId}`);

          // Poll for the Textract job to complete
          let textractStatus = 'IN_PROGRESS';
          while (textractStatus === 'IN_PROGRESS') {
              console.log("Waiting for Textract job to complete...");
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds

              const getJobStatusCommand = new GetDocumentTextDetectionCommand({
                  JobId: jobId
              });
              const jobStatusResponse = await textractClient.send(getJobStatusCommand);

              textractStatus = jobStatusResponse.JobStatus;
              console.log(`Textract Job Status: ${textractStatus}`);
          }

          if (textractStatus === 'SUCCEEDED') {
              // Fetch all pages of results
              let textractResult = [];
              let nextToken = null;

              do {
                  const getResultParams = {
                      JobId: jobId,
                      NextToken: nextToken
                  };
                  const getResultCommand = new GetDocumentTextDetectionCommand(getResultParams);
                  const response = await textractClient.send(getResultCommand);

                  if (Array.isArray(response.Blocks)) {
                      textractResult = textractResult.concat(response.Blocks);
                      console.log("Fetched page of blocks, next token: ", response.NextToken);
                  } else {
                      console.warn("No Blocks found in response, moving to next token if available");
                  }
                  nextToken = response.NextToken;
              } while (nextToken);

              // Extract text from Textract response
              documentContent = textractResult
                  .filter(block => block.BlockType === 'LINE')
                  .map(line => line.Text)
                  .join('\n');
              console.log("Extracted document content from Textract.");
          } else {
              throw new Error(`Textract job failed with status: ${textractStatus}`);
          }


      } else if (documentKey.split('/').pop() == 'NOFO-File-TXT') {
          // Handle text content directly
          console.log("Processing TXT file");
          documentContent = await streamToString(documentResult.Body);
      } else {
          throw new Error("Unsupported file type. Only PDF and TXT are supported.");
      }

      if (!documentContent || documentContent.length === 0) {
          console.log("3: Document content is empty or null.");
          throw new Error("Document content is empty or null.");
      }
      console.log("Document Length: ", documentContent.length);

      // Chunk the document content if it exceeds the model's input limit
      const MAX_CHUNK_SIZE = 50000; // Adjust based on model's token limit
      const documentChunks = splitTextIntoChunks(documentContent, MAX_CHUNK_SIZE);
      console.log(`6: Document split into ${documentChunks.length} chunks`);

      const summaries = [];
      for (const chunk of documentChunks) {
          // Summarize document chunk using Claude via AWS Bedrock
          const bedrockCommand = createBedrockCommand(chunk);
          const response = await bedrockClient.send(bedrockCommand);

          // Decode Uint8Array directly instead of treating it as a stream
          const responseBody = new TextDecoder("utf-8").decode(response.body);
          let completion;
          try {
              completion = JSON.parse(responseBody);
          } catch (parseError) {
              console.log("5: Error parsing response body:", parseError);
              throw new Error("Failed to parse the response from Claude.");
          }
          console.log("6: Document Summary:", completion);
          const completionExtract = completion.content[0].text;
          console.log("7: completionExtract: ", completionExtract);
          const requirementsJSON = completionExtract.match(/{[\s\S]*}/);
          console.log("8: requirementsJSON: ", requirementsJSON);

          if (requirementsJSON) {
              summaries.push(requirementsJSON[0]);
          }
      }
      if (summaries.length === 0){
        throw new Error("No summaries were generated form the document chunks");
      }

      // Merge summaries if there are multiple chunks
      let mergedSummary;
      if (documentChunks.length > 1) {
          console.log("9: doc chunks more than 1: ", documentChunks.length);
          const bedrockCommand = createBedrockCommand(summaries, true);
          const response = await bedrockClient.send(bedrockCommand);

          // Decode Uint8Array directly instead of treating it as a stream
          const responseBody = new TextDecoder("utf-8").decode(response.body);
          let completion;
          try {
              completion = JSON.parse(responseBody);
          } catch (parseError) {
              console.log("5: Error parsing response body:", parseError);
              throw new Error("Failed to parse the response from Claude.");
          }
          console.log("11: Document Summary:", completion);
          const completionExtract = completion.content[0].text;
          console.log("12: completionExtract: ", completionExtract);
          const requirementsJSON = completionExtract.match(/{[\s\S]*}/);
          console.log("13: requirementsJSON: ", requirementsJSON);

          if (requirementsJSON) {
              console.log("14: requirementsJSON: ", requirementsJSON[0]);
              mergedSummary = JSON.parse(requirementsJSON[0]);
              console.log("14.5: mergedSummary of if: ", mergedSummary);
          } else {
            console.error("14.7Failed to extract JSON from the model's response: ", completionExtract)
          }
      } else {
          console.log("15: single summaries: ", summaries[0]);
          mergedSummary = JSON.parse(summaries[0]);
          console.log("14.7: mergedSummary of else: ", mergedSummary);
      }

      // Upload summary to new S3 bucket in the same folder as the original document
      const folderPath = documentKey.substring(0, documentKey.lastIndexOf('/') + 1);
      //const baseFileName = documentKey.split('/').pop().split('.').slice(0, -1).join('.'); // Remove the file extension from the original document key
      const params = {
          Bucket: s3Bucket,
          Key: `${folderPath}summary.json`,
          Body: JSON.stringify(mergedSummary, null, 2),
          ContentType: 'application/json'
      };

      const upload = new Upload({
          client: s3Client,
          params,
      });
      await upload.done();
      console.log("7: Uploaded summary to the same folder.");

      const lambdaClient = new LambdaClient();
      const invokeCommand = new InvokeCommand({
        FunctionName: process.env.SYNC_KB_FUNCTION_NAME,
        InvocationType: 'Event',
      });
      try {
        await lambdaClient.send(invokeCommand);
        console.log("Invoked syncKB");
      } catch (error){
        console.error("Failed to invoke syncKBFunction:", error);
      }

      return {
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
              summary: mergedSummary
          }),
      };
  } catch (error) {
      console.error("Error processing document:", error);
      return {
          statusCode: 500,
          headers: {
              'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
              message: 'Failed to process document. Internal Server Error.',
              error: error.message,
          }),
      };
  }
}
};

// Helper function to convert stream to string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  


// Helper function to split text into chunks based on token size
function splitTextIntoChunks(text, maxTokens) {
  //const chunkSize = Math.floor(maxTokens * 4); // Estimate token limit in terms of characters (for simplicity)
  const chunks = [];
  let currentIndex = 0;
  while (currentIndex < text.length){
    chunks.push(text.substring(currentIndex, currentIndex + maxTokens));
    currentIndex += maxTokens;
  }
  return chunks;
}

// Helper function to create Bedrock command
function createBedrockCommand(contents, isMerged = false) {
  const prompt = isMerged ?
       `You are an AI assistant that helps categorize NOFO documents into various categories. Here are multiple summaries. Read all the summaries and extract relevant information and do not duplicate information. Please extract the grant name and categorize the information into 4 categories: Eligibility Criteria, Required Documents, Project Narrative Sections, and Key Deadlines. Provide a detailed description for each category and explain what each specific item means in 2-3 sentences. If any of the items are missing, mention that the section is missing in the summary. Format the output in JSON format. The expected format is as follows:{"GrantName": "Name of the grant","EligibilityCriteria": [{ "item": "Eligibility Item 1", "description": "Explanation of what Eligibility Item 1 means." },{ "item": "Eligibility Item 2", "description": "Explanation of what Eligibility Item 2 means." }],"RequiredDocuments": [{ "item": "Document Name 1", "description": "Explanation of what Document Name 1 means." },{ "item": "Document Name 2", "description": "Explanation of what Document Name 2 means." }],"ProjectNarrativeSections": [{ "item": "Section Name 1", "description": "Explanation of what Section Name 1 means." },{ "item": "Section Name 2", "description": "Explanation of what Section Name 2 means." }],"KeyDeadlines": [{ "item": "Deadline 1", "description": "Explanation of what Deadline 1 means." },{ "item": "Deadline 2", "description": "Explanation of what Deadline 2 means." }]}\n\n${contents}` :
       `You are an AI assistant that helps categorize NOFO documents into various categories. Here is a NOFO document. Please extract the name of the grant and categorize the information into 4 categories: Eligibility Criteria, Required Documents, Project Narrative Sections, and Key Deadlines. Provide a detailed description for each category and explain what each specific item means in 2-3 sentences. If any of the items are missing, mention that the section is missing in the summary. Format the output in JSON format. The expected format is as follows:{"GrantName": "Name of the grant","EligibilityCriteria": [{ "item": "Eligibility Item 1", "description": "Explanation of what Eligibility Item 1 means." },{ "item": "Eligibility Item 2", "description": "Explanation of what Eligibility Item 2 means." }],"RequiredDocuments": [{ "item": "Document Name 1", "description": "Explanation of what Document Name 1 means." },{ "item": "Document Name 2", "description": "Explanation of what Document Name 2 means." }],"ProjectNarrativeSections": [{ "item": "Section Name 1", "description": "Explanation of what Section Name 1 means." },{ "item": "Section Name 2", "description": "Explanation of what Section Name 2 means." }],"KeyDeadlines": [{ "item": "Deadline 1", "description": "Explanation of what Deadline 1 means." },{ "item": "Deadline 2", "description": "Explanation of what Deadline 2 means." }]}\n\n${contents}`;

  return new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          messages: [{
              role: "user",
              content: prompt
          }],
          max_tokens: 3500,
          temperature: 0,
      }),
  });
}