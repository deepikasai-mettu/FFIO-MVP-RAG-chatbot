import { ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { BedrockAgentRuntimeClient, RetrieveCommand as KBRetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import ClaudeModel from "./models/claude3Sonnet.mjs";
import Mistral7BModel from "./models/mistral7b.mjs";
//import { type } from 'os';

/*global fetch*/

const ENDPOINT = process.env.WEBSOCKET_API_ENDPOINT;
const SYS_PROMPT = process.env.PROMPT;
const wsConnectionClient = new ApiGatewayManagementApiClient({ endpoint: ENDPOINT });

/* Use the Bedrock Knowledge Base*/
/* Use the Bedrock Knowledge Base*/
async function retrieveKBDocs(query, knowledgeBase, knowledgeBaseID, documentIdentifier) {
  const input = { // RetrieveRequest
    knowledgeBaseId: knowledgeBaseID, // required
    retrievalQuery: { // KnowledgeBaseQuery
      text: query, // required
    }
  };

  try {
    const command = new KBRetrieveCommand(input);
    const response = await knowledgeBase.send(command);

    // Define the folder path in S3 bucket 
    const folderPath = documentIdentifier.endsWith("/") ? documentIdentifier : `${documentIdentifier}/`; // Ensure the folder ends with "/"

    console.log("folderpath: ", folderPath);
    console.log("retrival results:", response.retrievalResults);
    console.log("s3 location: ", item => item.location?.s3Location);
    // Filter items by confidence and by S3 location to include only those in the specified folder
    const confidenceFilteredResults = response.retrievalResults.filter(item => {
      try {
        return (
          item.score > 0.5 && 
          item.location?.s3Location?.uri &&
          item.location.s3Location.uri.includes(folderPath)
        );
      } catch (error){
        console.warn("Skipping item due to missing properties:", item);
        return false;
      }
    });
    console.log("confidenceFilteredResults: ", confidenceFilteredResults);

    let fullContent = confidenceFilteredResults.map(item => item.content.text).join('\n');
    const documentUris = confidenceFilteredResults.map(item => {
      return {
        title: item.location.s3Location.uri.slice(
          item.location.s3Location.uri.lastIndexOf("/") + 1
        ) + " (Bedrock Knowledge Base)",
        uri: item.location.s3Location.uri,
      };
    });
    console.log("documentUris: ", documentUris);

    // Remove duplicate sources based on URI
    // const flags = new Set();
    // const uniqueUris = documentUris.filter(entry => {
    //   if (flags.has(entry.uri)) {
    //     return false;
    //   }
    //   flags.add(entry.uri);
    //   return true;
    // });

    // Remove duplicate sources based on URI
    const uniqueUris = Array.from(
      new Map(documentUris.map(item => [item.uri, item])).values()
    );

    if (fullContent === '') {
      fullContent = `No knowledge available! This query is likely outside the scope of your knowledge.
      Please provide a general answer but do not attempt to provide specific details.`;
      console.log("Warning: no relevant sources found");
    }

    return {
      content: fullContent,
      uris: uniqueUris
    };
  } catch (error) {
    console.error("Caught error: could not retrieve Knowledge Base documents:", error);
    return {
      content: `No knowledge available! There is something wrong with the search tool. Please tell the user to submit feedback.
      Please provide a general answer but do not attempt to provide specific details.`,
      uris: []
    };
  }
}

const getUserResponse = async (id, requestJSON) => {
  try {
    const data = requestJSON.data;   
    console.log("Print data:", data);
    

    let userMessage = data.userMessage;
    const userId = data.user_id;
    const sessionId = data.session_id;
    const chatHistory = data.chatHistory;   
    const documentIdentifier = data.documentIdentifier;
    console.log("documentIdentifier: ", documentIdentifier);
    
    const knowledgeBase = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

    if (!process.env.KB_ID) {
      throw new Error("Knowledge Base ID is not found.");
    }        

    // retrieve a model response based on the last 5 messages
    // messages come paired, so that's why the slice is only 2 (2 x 2 + the latest prompt = 5)
    let claude = new ClaudeModel();
    let lastFiveMessages = chatHistory.slice(-2);
    
    let stopLoop = false;        
    let modelResponse = '';
    // if (!userMessage && chatHistory.length === 0){
    //   console.log("Starting session with proactive message");
    //   modelResponse = 'Hello! Welcome to grantwell. I see that you are working on ${documentIdentifier}. How can I help you today?';
      
    //   const proactiveMessageParams = {
    //     ConnectionId: id,
    //     Data: modelResponse
    //   };
    //   const command = new PostToConnectionCommand(proactiveMessageParams);
    //   try{
    //     await wsConnectionClient.send(command);
    //     console.log("Proactive message to user");
    //   } catch (error) {
    //     console.error("Error sending proactive message: ", error);
    //   }
    //   return;
    // }
    
    
    let history = claude.assembleHistory(lastFiveMessages, "Please use your search tool one or more times based on this latest prompt: ".concat(userMessage))  ;  
    let fullDocs = {"content" : "", "uris" : []};
    
    while (!stopLoop) {
      console.log("started new stream");
      // console.log(lastFiveMessages)
      // console.log(history)
      history.forEach((historyItem) => {
        console.log(historyItem);
      });
      //Updating the system prompt with the grant name
      const updatedSystemPrompt = `The grant name: ${documentIdentifier} and ${SYS_PROMPT}`;
      console.log("updatedSystemPrompt: ", updatedSystemPrompt);
      const stream = await claude.getStreamedResponse(updatedSystemPrompt, history);
      try {
        // store the full model response for saving to sessions later
        
        let toolInput = "";
        let assemblingInput = false;
        let usingTool = false;
        let toolId;
        let skipChunk = true;
        // this is for when the assistant uses a tool
        let message = {};
        // this goes in that message
        let toolUse = {};
        
        // iterate through each chunk from the model stream
        for await (const event of stream) {
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          const parsedChunk = await claude.parseChunk(chunk);
          if (parsedChunk) {                      
            
            // this means that we got tool use input or stopped generating text
            if (parsedChunk.stop_reason) {
              if (parsedChunk.stop_reason == "tool_use") {
                assemblingInput = false;
                usingTool = true;
                skipChunk = true;
              } else {
                stopLoop = true;
                break;
              }
            }
            
            // this means that we are collecting tool use input
            if (parsedChunk.type) {
             if (parsedChunk.type == "tool_use") {
               assemblingInput = true;
               toolId = parsedChunk.id;
               message['role'] = 'assistant';
               message['content'] = [];
               toolUse['name'] = parsedChunk.name;
               toolUse['type'] = 'tool_use';
               toolUse['id'] = toolId;
               toolUse['input'] = {'query' : ""};
             } 
            }
            
            
            if (usingTool) {
              
              // get the full block of context from knowledge base
              let docString;
              console.log("tool input");
              console.log(toolInput);
              let query = JSON.parse(toolInput);
              
              console.log("using knowledge bases!");
              docString = await retrieveKBDocs(query.query, knowledgeBase, process.env.KB_ID, documentIdentifier);
              fullDocs.content = fullDocs.content.concat(docString.content);
              fullDocs.uris = fullDocs.uris.concat(docString.uris) ;             
              
              // add the model's query to the tool use message
              toolUse.input.query = query.query;
              // add the tool use message to chat history
              message.content.push(toolUse);
              history.push(message);
              
              // add the tool response to chat history
              let toolResponse = {
                  "role": "user",
                  "content": [
                      {
                          "type": "tool_result",
                          "tool_use_id": toolId,
                          "content": docString.content
                      }
                  ]
              };
              
              history.push(toolResponse);
              
              usingTool = false;
              toolInput = "";
              
              console.log("correctly used tool!");
              
            } else {             
            
              if  (assemblingInput & !skipChunk) {
                toolInput = toolInput.concat(parsedChunk);
                // toolUse.input.query += parsedChunk;
              } else if (!assemblingInput) {
                // console.log('writing out to user')
                let responseParams = {
                  ConnectionId: id,
                  Data: parsedChunk.toString()
                };
                modelResponse = modelResponse.concat(parsedChunk);
                let command = new PostToConnectionCommand(responseParams);
                        
                try {
                  await wsConnectionClient.send(command);
                } catch (error) {
                  console.error("Error sending chunk:", error);
                }
              } else if (skipChunk) {
                skipChunk = false;
              }
            }
            
            
            
          }
        }        
        
      } catch (error) {
        console.error("Stream processing error:", error);
        let responseParams = {
          ConnectionId: id,
          Data: `<!ERROR!>: ${error}`
        };
        let command = new PostToConnectionCommand(responseParams);
        await wsConnectionClient.send(command);
      }
  
    }

    let command;
    let links = JSON.stringify(fullDocs.uris);
    // send end of stream message
    try {
      let eofParams = {
        ConnectionId: id,
        Data: "!<|EOF_STREAM|>!"
      };
      command = new PostToConnectionCommand(eofParams);
      await wsConnectionClient.send(command);

      // send sources
      let responseParams = {
        ConnectionId: id,
        Data: links
      };
      command = new PostToConnectionCommand(responseParams);
      await wsConnectionClient.send(command);
    } catch (e) {
      console.error("Error sending EOF_STREAM and sources:", e);
    }


    const sessionRequest = {
      body: JSON.stringify({
        "operation": "get_session",
        "user_id": userId,
        "session_id": sessionId,

      })
    };
    const client = new LambdaClient({});
    const lambdaCommand = new InvokeCommand({
      FunctionName: process.env.SESSION_HANDLER,
      Payload: JSON.stringify(sessionRequest),
    });

    const { Payload, LogResult } = await client.send(lambdaCommand);
    const result = Buffer.from(Payload).toString();

    // Check if the request was successful
    if (!result) {
      throw new Error(`Error retriving session data!`);
    }

    // Parse the JSON
    let output = {};
    try {
      const response = JSON.parse(result);
      output = JSON.parse(response.body);
      console.log('Parsed JSON:', output);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      let responseParams = {
        ConnectionId: id,
        Data: '<!ERROR!>: Unable to load past messages, please retry your query'
      };
      command = new PostToConnectionCommand(responseParams);
      await wsConnectionClient.send(command);
      return; // Optional: Stop further execution in case of JSON parsing errors
    }

    // Continue processing the data
    const retrievedHistory = output.chat_history;
    let operation = '';
    let title = ''; // Ensure 'title' is initialized if used later in your code

    let newChatEntry = [{ "user": userMessage, "chatbot": modelResponse, "metadata": links }];
    
    if (retrievedHistory === undefined) {
      operation = 'add_session';
      let titleModel = new Mistral7BModel();
      const CONTEXT_COMPLETION_INSTRUCTIONS =
        `<s>[INST]Generate a concise title for this chat session based on the initial user prompt and response. The title should succinctly capture the essence of the chat's main topic without adding extra content.[/INST]
      [INST]${userMessage}[/INST]
      ${modelResponse} </s>
      Here's your session title:`;
      title = await titleModel.getPromptedResponse(CONTEXT_COMPLETION_INSTRUCTIONS, 25);
      title = title.replaceAll(`"`, '');
    } else {
      operation = 'update_session';
    }

    const sessionSaveRequest = {
      body: JSON.stringify({
        "operation": operation,
        "user_id": userId,
        "session_id": sessionId,
        "new_chat_entry": newChatEntry,
        "title": title,
        "document_identifier": documentIdentifier,
      })
    };

    const lambdaSaveCommand = new InvokeCommand({
      FunctionName: process.env.SESSION_HANDLER,
      Payload: JSON.stringify(sessionSaveRequest),
    });

    // const { SessionSavePayload, SessionSaveLogResult } = 
    await client.send(lambdaSaveCommand);

    const input = {
      ConnectionId: id,
    };
    await wsConnectionClient.send(new DeleteConnectionCommand(input));

  } catch (error) {
    console.error("Error:", error);
    let responseParams = {
      ConnectionId: id,
      Data: `<!ERROR!>: ${error}`
    };
    let command = new PostToConnectionCommand(responseParams);
    await wsConnectionClient.send(command);
  }
};

export const handler = async (event) => {
  if (event.requestContext) {    
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    let body = {};
    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
    console.log(routeKey);

    switch (routeKey) {
      case '$connect':
        console.log('CONNECT');
        // try{
        //   const proactiveMessageParams = {
        //     ConnectionId: connectionId,
        //     Data: "Hello! Welcome to GrantWell chatbot. Let me know how I can assist you."
        //   };
        //   const command = new PostToConnectionCommand(proactiveMessageParams);
        //   await wsConnectionClient.send(command);
        //   console.log("Proactive greeting sent to user on connection");
        // } catch {
        //   console.log("Error sending proactive greeting: ");
        // }
        return { statusCode: 200 };
      case '$disconnect':
        console.log('DISCONNECT');
        return { statusCode: 200 };
      case '$default':
        console.log('DEFAULT');
        return { 'action': 'Default Response Triggered' };
      case "getChatbotResponse":
        console.log('GET CHATBOT RESPONSE');
        await getUserResponse(connectionId, body);
        return { statusCode: 200 };      
      default:
        return {
          statusCode: 404,  // 'Not Found' status code
          body: JSON.stringify({
            error: "The requested route is not recognized."
          })
        };
    }
  }
  return {
    statusCode: 200,
  };
};