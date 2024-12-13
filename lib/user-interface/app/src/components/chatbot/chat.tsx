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
  Checkbox,
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
  const appContext = useContext(AppContext);
  const [running, setRunning] = useState<boolean>(true);
  const [session, setSession] = useState<{ id: string; loading: boolean }>({
    id: props.sessionId ?? uuidv4(),
    loading: typeof props.sessionId !== "undefined",
  });

  const { notifications, addNotification } = useNotifications();
  const [messageHistory, setMessageHistory] = useState<ChatBotHistoryItem[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);

  // Check localStorage on component mount
  useEffect(() => {
    const shouldShowPopup = localStorage.getItem('showGrantWellPopup');
    if (shouldShowPopup === 'false') {
      setShowPopup(false);
    }
  }, []);

  // Handle checkbox change
  const handleDoNotShowAgainChange = ({ detail }: { detail: { checked: boolean } }) => {
    setDoNotShowAgain(detail.checked);
  };

  // Handle modal dismiss
  const handleModalDismiss = () => {
    if (doNotShowAgain) {
      localStorage.setItem('showGrantWellPopup', 'false');
    }
    setShowPopup(false);
  };

  /** Loads session history */
  // chat.tsx

useEffect(() => {
  if (!appContext) return;
  setMessageHistory([]);

  (async () => {
    if (!props.sessionId) {
      const newSessionId = uuidv4();
      setSession({ id: newSessionId, loading: false });
      // const username = await Auth.currentAuthenticatedUser().then(
      //   (value) => value.username
      // );
      // const apiClient = new ApiClient(appContext);
      // try {
      //   await apiClient.sessions.createSession(
      //     newSessionId,
      //     username,
      //     props.documentIdentifier
      //   );
      //   // Load the session to get the initial chatbot message
      //   const hist = await apiClient.sessions.getSession(
      //     newSessionId,
      //     username
      //   );
      //   setMessageHistory(hist);
      // } catch (error) {
      //   console.error("Error creating new session:", error);
      // }
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

      if (hist && hist.length >0) {
        setMessageHistory(hist);
        window.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
      else if(hist.length == 0) {
        const summaryResult = await apiClient.landingPage.getNOFOSummary(props.documentIdentifier);
        const grantName = summaryResult.data.GrantName;

        const initialMessage = {
          type: ChatBotMessageType.AI,
            content: `Hello! I see that you are working on the ${grantName} grant. Could you please tell me which agency, municipality, or tribe we are building this narrative for?`,
            metadata: {},
         };
        setMessageHistory([initialMessage]);

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
    <div className={styles.chat_container} style={{
      height: "calc(100vh - 100px)", // Adjust height to leave space for header/footer
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Popup Modal */}
      {showPopup && (
        <Modal
          onDismiss={handleModalDismiss}
          visible={showPopup}
          closeAriaLabel="Close popup"
          header="Welcome to GrantWell!"
        >
          {/* <SpaceBetween direction="vertical" size="m"> */}
            <p>
              Welcome to the GrantWell chatbot interface! The purpose of this chatbot is to prompt you through the project narrative section of your grant.
            </p>
            <p>
              The chatbot will begin by prompting you for some basic information.
            </p>
            <p>
              For GrantWell to work best, upload supplementary data through the "upload data' link to best help us craft a narrative that reflects your organization.
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
              Ensure you upload all supplementary data before beginning conversation with the chatbot.
            </p>
            <p>
              Click the "i" icon in the upper right corner to access this information again.
            </p>
            <Checkbox
              onChange={handleDoNotShowAgainChange}
              checked={doNotShowAgain}
            >
              Do not show this message again
            </Checkbox>
          {/* </SpaceBetween> */}
        </Modal>
      )}

      <div style={{
        flex: 1,
        overflowY: "auto",
        paddingBottom: "20px"
      }}>
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
      </div>

      <div className={styles.input_container} style={{
        position: "sticky",
        bottom: 0,
        backgroundColor: "white",
        paddingTop: "10px"
      }}>
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
