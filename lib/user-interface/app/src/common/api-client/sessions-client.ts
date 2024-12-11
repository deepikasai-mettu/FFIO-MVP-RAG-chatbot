import {
  ChatBotHistoryItem,
  ChatBotMessageType,
} from "../../components/chatbot/types";

import {
  Utils
} from "../utils"


import { AppConfig } from "../types";
import { error } from "console";

export class SessionsClient {

  private readonly API;
  constructor(protected _appConfig: AppConfig) {
    this.API = _appConfig.httpEndpoint.slice(0, -1);
  }
  // Gets all sessions tied to a given user ID
  // Return format: [{"session_id" : "string", "user_id" : "string", "time_stamp" : "dd/mm/yy", "title" : "string"}...]
  async getSessions(
    userId: string,
    documentIdentifier: string,
    all?: boolean
  ) {
    const auth = await Utils.authenticate();
    let validData = false;
    let output = [];
    let runs = 0;
    let limit = 3;
    let errorMessage = "Could not load sessions"
    while (!validData && runs < limit) {
      runs += 1;
      const body = {
        operation: all ? "list_all_sessions_by_user_id" : "list_sessions_by_user_id",
        user_id: userId,
      };
      if (documentIdentifier){
        body['document_identifier'] = documentIdentifier;
      }
      const response = await fetch(this.API + '/user-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth,
        },
        //body: JSON.stringify(all? { "operation": "list_all_sessions_by_user_id", "user_id": userId, "documentIdentifier": documentIdentifier } : { "operation": "list_sessions_by_user_id", "user_id": userId, "documentIdentifier": documentIdentifier })
        body: JSON.stringify(body)
      });
      if (response.status != 200) {
        validData = false;
        let jsonResponse = await response.json()        
        errorMessage = jsonResponse;        
        break;
      }      
      try {
        output = await response.json();
        validData = true;
      } catch (e) {
        // just retry, we get 3 attempts!
        console.log(e);
      }
    }
    if (!validData) {
      throw new Error(errorMessage);
    }
    return output;
  }

  // Returns a chat history given a specific user ID and session ID
  // Return format: ChatBotHistoryItem[]
  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<ChatBotHistoryItem[]> {
    const auth = await Utils.authenticate();
    let validData = false;
    let output;
    let runs = 0;
    let limit = 3;
    let errorMessage = "Could not load session";

    /** Attempt to load a session up to 3 times or until it is validated */
    while (!validData && runs < limit) {
      runs += 1;
      const response = await fetch(this.API + '/user-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth,
        },
        body: JSON.stringify({
          "operation": "get_session", 
          "session_id": sessionId,
          "user_id": userId
        }),
      });
      /** Check for errors */
      if (response.status != 200) {
        validData = false;
        errorMessage = await response.json();
        break;
      }
      
      const reader = response.body.getReader();
      let received = new Uint8Array(0);

      /** Read the response stream */
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          let temp = new Uint8Array(received.length + value.length);
          temp.set(received);
          temp.set(value, received.length);
          received = temp;
        }
      }
      // Decode the complete data
      const decoder = new TextDecoder('utf-8');
      const decoded = decoder.decode(received);
      try {
        output = JSON.parse(decoded).chat_history! as any[];
        validData = true;
      } catch (e) {
        console.log(e);
      }
    }
    if (!validData) {
      throw new Error(errorMessage)
    }

    let normalizedOutput: any[] = [];
    let history: ChatBotHistoryItem[] = [];
    if (output === undefined) {
      console.log("in the sessions-clients undefined output");
      return history;
    }

    // Check each element. If it's an array, we spread it into normalizedOutput; otherwise, push directly.
    output.forEach((element: any) => {
      if (Array.isArray(element)) {
        normalizedOutput.push(...element);
      } else {
        normalizedOutput.push(element);
      }
    });

    
    normalizedOutput.forEach((item: any) => {

      // Parse metadata if it's a string, otherwise keep it as is.
      const parsedMetadata = typeof item.metadata === "string" 
        ? JSON.parse(item.metadata) 
        : item.metadata;

      // If there's a user message, add it as a human message in the history
      if (item.user) {
        history.push({
          type: ChatBotMessageType.Human,
          content: item.user || "",
          metadata: {}
        });
      }

      // If there's a chatbot message, add it as an AI message in the history
      if (item.chatbot) {
        history.push({
          type: ChatBotMessageType.AI,
          content: item.chatbot || "",
          metadata: parsedMetadata || {}
        });
      }
    });

    return history;


  }

  /**Deletes a given session but this is not exposed in the UI */
  async deleteSession(
    sessionId: string,
    userId: string,
  ) {
    try {
      const auth = await Utils.authenticate();
      const response = await fetch(this.API + '/user-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth,
        },
        body: JSON.stringify({
          "operation": "delete_session", "session_id": sessionId,
          "user_id": userId
        })
      });
    } catch {
      return "FAILED";
    }
    return "DONE";
  }

}