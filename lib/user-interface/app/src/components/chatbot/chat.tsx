import { useContext, useEffect, useState } from "react";
import {
  ChatBotHistoryItem,
  ChatBotMessageType,
  FeedbackData,
} from "./types";
import { Auth } from "aws-amplify";
import {
  SpaceBetween,
  StatusIndicator,
  Alert,
  Modal,
} from "@cloudscape-design/components";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api-client/api-client";
import ChatMessage from "./chat-message";
import ChatInputPanel, { ChatScrollState } from "./chat-input-panel";
import styles from "../../styles/chat.module.scss";
import { CHATBOT_NAME } from "../../common/constants";
import { useNotifications } from "../notif-manager";

export default function Chat(props: { sessionId?: string; documentIdentifier?: string }) {
  console.log("Chat props doc identifier: ", props.documentIdentifier);
  const appContext = useContext(AppContext);
  const [running, setRunning] = useState<boolean>(true);
  const [session, setSession] = useState<{ id: string; loading: boolean }>({
    id: props.sessionId ?? uuidv4(),
    loading: typeof props.sessionId !== "undefined",
  });

  const { notifications, addNotification } = useNotifications();
  const [messageHistory, setMessageHistory] = useState<ChatBotHistoryItem[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(true); // State for popup visibility

  /** Loads session history */
  // chat.tsx

useEffect(() => {
  if (!appContext) return;
  setMessageHistory([]);

  (async () => {
    if (!props.sessionId) {
      const newSessionId = uuidv4();
      setSession({ id: newSessionId, loading: false });
      const username = await Auth.currentAuthenticatedUser().then(
        (value) => value.username
      );
      const apiClient = new ApiClient(appContext);
      try {
        await apiClient.sessions.createSession(
          newSessionId,
          username,
          props.documentIdentifier
        );
        // Load the session to get the initial chatbot message
        const hist = await apiClient.sessions.getSession(
          newSessionId,
          username
        );
        setMessageHistory(hist);
      } catch (error) {
        console.error("Error creating new session:", error);
      }
      return;
    }

    setSession({ id: props.sessionId, loading: true });
    const apiClient = new ApiClient(appContext);
    try {
      const username = await Auth.currentAuthenticatedUser().then(
        (value) => value.username
      );
      if (!username) return;
      const hist = await apiClient.sessions.getSession(props.sessionId, username);

      if (hist) {
        setMessageHistory(hist);
        window.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
      setSession({ id: props.sessionId, loading: false });
      setRunning(false);
    } catch (error) {
      console.log(error);
      addNotification("error", error.message);
      addNotification("info", "Please refresh the page");
    }
  })();
}, [appContext, props.sessionId, props.documentIdentifier]);


  /** Adds some metadata to the user's feedback */
  const handleFeedback = (
    feedbackType: 1 | 0,
    idx: number,
    message: ChatBotHistoryItem,
    feedbackTopic?: string,
    feedbackProblem?: string,
    feedbackMessage?: string
  ) => {
    if (props.sessionId) {
      console.log("submitting feedback...");

      const prompt = messageHistory[idx - 1].content;
      const completion = message.content;

      const feedbackData = {
        sessionId: props.sessionId,
        feedback: feedbackType,
        prompt: prompt,
        completion: completion,
        topic: feedbackTopic,
        problem: feedbackProblem,
        comment: feedbackMessage,
        sources: JSON.stringify(message.metadata.Sources),
        documentIdentifier: props.documentIdentifier,
      };
      addUserFeedback(feedbackData);
    }
  };

  /** Makes the API call via the ApiClient to submit the feedback */
  const addUserFeedback = async (feedbackData: FeedbackData) => {
    if (!appContext) return;
    const apiClient = new ApiClient(appContext);
    await apiClient.userFeedback.sendUserFeedback(feedbackData);
  };

  return (
    <div className={styles.chat_container}>
      {/* Popup Modal */}
      {showPopup && (
        <Modal
          onDismiss={() => setShowPopup(false)}
          visible={showPopup}
          closeAriaLabel="Close popup"
          header="Welcome to GrantWell!"
        >
          <p>
          Welcome to the GrantWell chatbot interface! The purpose of this chatbot is to prompt you through the project narrative section of your grant.
          </p>
          <p>
          The chatbot will begin by prompting you for some basic information.
          </p>
          <p>
          For GrantWell to work best, upload supplementary data through the "upload data' linkto best help us craft a narrative that reflects your organization.
          </p>
          <p>
          Examples of data could include:
          </p> 
          <li>
            Last year's annual report 
          </li>
          <li>
            Latest accomplishments
          </li>
          <li>
            Previously submitted proposals for this grant
          </li>
          <li>
            Project narrative template
          </li>
          <p>
          You can also provide links to the chatbot directly to relevant sites or articles pertaining to your organization or project goals.
          </p>
          <p>
            Click the "i" icon in the upper right corner to access this information again.
          </p>
        </Modal>
      )}

      <SpaceBetween direction="vertical" size="m">
        {messageHistory.length == 0 && !session?.loading && (
          <Alert statusIconAriaLabel="Info" header="">
            AI Models can make mistakes. Be mindful in validating important information.
          </Alert>
        )}

        {messageHistory.map((message, idx) => (
          <ChatMessage
            key={idx}
            message={message}
            onThumbsUp={() => handleFeedback(1, idx, message)}
            onThumbsDown={(feedbackTopic: string, feedbackType: string, feedbackMessage: string) =>
              handleFeedback(0, idx, message, feedbackTopic, feedbackType, feedbackMessage)
            }
          />
        ))}
      </SpaceBetween>
      <div className={styles.welcome_text}>
        {messageHistory.length == 0 && !session?.loading && (
          <center>{CHATBOT_NAME}</center>
        )}
        {session?.loading && (
          <center>
            <StatusIndicator type="loading">Loading session</StatusIndicator>
          </center>
        )}
      </div>
      <div className={styles.input_container}>
        <ChatInputPanel
          session={session}
          running={running}
          setRunning={setRunning}
          messageHistory={messageHistory}
          setMessageHistory={(history) => setMessageHistory(history)}
          documentIdentifier={props.documentIdentifier}
        />
      </div>
    </div>
  );
}


// import { useContext, useEffect, useState } from "react";
// import {  
//   ChatBotHistoryItem,
//   ChatBotMessageType,  
//   FeedbackData
// } from "./types";
// import { Auth } from "aws-amplify";
// import { SpaceBetween, StatusIndicator, Alert, Flashbar } from "@cloudscape-design/components";
// import { v4 as uuidv4 } from "uuid";
// import { AppContext } from "../../common/app-context";
// import { ApiClient } from "../../common/api-client/api-client";
// import ChatMessage from "./chat-message";
// import ChatInputPanel, { ChatScrollState } from "./chat-input-panel";
// import styles from "../../styles/chat.module.scss";
// import { CHATBOT_NAME } from "../../common/constants";
// import { useNotifications } from "../notif-manager";

// export default function Chat(props: { sessionId?: string; documentIdentifier?: string}) {
//   console.log("Chat props doc identifier: ", props.documentIdentifier);
//   const appContext = useContext(AppContext);
//   const [running, setRunning] = useState<boolean>(true);
//   const [session, setSession] = useState<{ id: string; loading: boolean; }>({
//     id: props.sessionId ?? uuidv4(),
//     loading: typeof props.sessionId !== "undefined",

//   });  

//   const { notifications, addNotification } = useNotifications();

//   const [messageHistory, setMessageHistory] = useState<ChatBotHistoryItem[]>(
//     []
//   );
  

//   /** Loads session history */
//   useEffect(() => {
//     if (!appContext) return;
//     setMessageHistory([]);

//     (async () => {
//       console.log("starting chat.tsx", props);
//       /** If there is no session ID, then this must be a new session
//        * and there is no need to load one from the backend.
//        * However, even if a session ID is set and there is no saved session in the 
//        * backend, there will be no errors - the API will simply return a blank session
//        */
//       if (!props.sessionId) {
//         const newSessionId = uuidv4();
//         setSession({ id: newSessionId, loading: false });
//         console.log("printing setSession", newSessionId);
//         const username = await Auth.currentAuthenticatedUser().then((value) => value.username);
//         const apiClient = new ApiClient(appContext);
//         // try{
//         //   console.log("in the try for async", props.documentIdentifier)
//         //   await apiClient.sessions.createSession(newSessionId, username, props.documentIdentifier);

//         // }catch (error) {
//         //   console.error("Error creating new session:", error);
//         // }
//         return;
//       }

//       setSession({ id: props.sessionId, loading: true });
//       const apiClient = new ApiClient(appContext);
//       try {
//         console.log("Start setSession from chat.tsx");
//         // const result = await apiClient.sessions.getSession(props.sessionId);
//         let username;
//         await Auth.currentAuthenticatedUser().then((value) => username = value.username);
//         if (!username) return;
//         const hist = await apiClient.sessions.getSession(props.sessionId,username);

//         if (hist) {
//           console.log("in the if statement after setsession", hist);
          
//           ChatScrollState.skipNextHistoryUpdate = true;
//           ChatScrollState.skipNextScrollEvent = true;
          
//           setMessageHistory(
//             hist
//               .filter((x) => x !== null)
//               .map((x) => ({
//                 type: x!.type as ChatBotMessageType,
//                 metadata: x!.metadata!,
//                 content: x!.content,
//               }))
//           );

//           window.scrollTo({
//             top: 0,
//             behavior: "instant",
//           });
//         } else {
//           console.log("else of hist, for create session")
//           //await apiClient.sessions.createSession(props.sessionId, username, props.documentIdentifier);
//         }
//         setSession({ id: props.sessionId, loading: false });
//         setRunning(false);
//       } catch (error) {
//         console.log(error);
//         addNotification("error",error.message)
//         addNotification("info","Please refresh the page")
//       }
//     })();
//   }, [appContext, props.sessionId, props.documentIdentifier]);

//   /** Adds some metadata to the user's feedback */
//   const handleFeedback = (feedbackType: 1 | 0, idx: number, message: ChatBotHistoryItem, feedbackTopic? : string, feedbackProblem? : string, feedbackMessage? : string) => {
//     if (props.sessionId) {
//       console.log("submitting feedback...")
      
//       const prompt = messageHistory[idx - 1].content
//       const completion = message.content;
      
//       const feedbackData = {
//         sessionId: props.sessionId, 
//         feedback: feedbackType,
//         prompt: prompt,
//         completion: completion,
//         topic: feedbackTopic,
//         problem: feedbackProblem,
//         comment: feedbackMessage,
//         sources: JSON.stringify(message.metadata.Sources),
//         documentIdentifier: props.documentIdentifier,
//       };
//       addUserFeedback(feedbackData);
//     }
//   };

//   /** Makes the API call via the ApiClient to submit the feedback */
//   const addUserFeedback = async (feedbackData : FeedbackData) => {
//     if (!appContext) return;
//     const apiClient = new ApiClient(appContext);
//     await apiClient.userFeedback.sendUserFeedback(feedbackData);
//   }

//   return (
//     <div className={styles.chat_container}> 
//       <SpaceBetween direction="vertical" size="m">
        
//       {messageHistory.length == 0 && !session?.loading && (
//        <Alert
//           statusIconAriaLabel="Info"
//           header=""
//        >
//         AI Models can make mistakes. Be mindful in validating important information.
//       </Alert> )}

      
//         {messageHistory.map((message, idx) => (
//           <ChatMessage
//             key={idx}
//             message={message}            
//             onThumbsUp={() => handleFeedback(1,idx, message)}
//             onThumbsDown={(feedbackTopic : string, feedbackType : string, feedbackMessage: string) => handleFeedback(0,idx, message,feedbackTopic, feedbackType, feedbackMessage)}                        
//           />
//         ))}
//       </SpaceBetween>
//       <div className={styles.welcome_text}>
//         {messageHistory.length == 0 && !session?.loading && (
//           <center>{CHATBOT_NAME}</center>
//         )}
//         {session?.loading && (
//           <center>
//             <StatusIndicator type="loading">Loading session</StatusIndicator>
//           </center>
//         )}
//       </div>
//       <div className={styles.input_container}>
//         <ChatInputPanel
//           session={session}
//           running={running}
//           setRunning={setRunning}
//           messageHistory={messageHistory}
//           setMessageHistory={(history) => setMessageHistory(history)}
//           documentIdentifier = {props.documentIdentifier}          
//         />
//       </div>
//     </div>
//   );
// }
