import BaseAppLayout from "../../../components/base-app-layout";
import Chat from "../../../components/chatbot/chat";

import { Link, useParams, useSearchParams } from "react-router-dom";
import { Header, HelpPanel } from "@cloudscape-design/components";

export default function Playground() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const documentIdentifier = searchParams.get("folder"); // Retrieve documentIdentifier
  console.log("PLAYGROUND Identifier:", documentIdentifier); // For debugging

  return (    
    <BaseAppLayout
      info={
        <HelpPanel header={<Header variant="h3">Welcome to the GrantWell chatbot interface!</Header>}>
                    <p>
            This chatbot will prompt you through the project narrative section of your grant. 
          </p>
          <p>
          To make this thing work best, do x y z (upload past data, past proposals, info about your org, etc) to best help us craft a narrative that reflects you.
          </p>
          <li>
            step 1: upload data (last years annual report, latest accomplishments, previous year's proposal if they have one, narrative template, etc) 
          </li>
          <li>
            step 2: input any relevant websites to the chatbot (or say "no websites" 
          </li>
          <li>
            Step 3: chatbot says to user: “do you want me to assess whether or not you are eligible to apply to this grant”
          </li>
          <li>
            Step 4: tell the user to review the prompt engineering guide if they need assistance
          </li>
          <li>
            Step 5: chatbot will begin to prompt you
          </li>
          <p>
            Click the "i" icon in the upper right corner to access this information again.
          </p>
          <p>
            This is a customizable chatbot application capable of both answering general questions
            as well as referencing custom documents in order to fit a specific business use-case.
          </p>
          <h3>Feedback</h3>
          <p>
            You can submit feedback on every response. Negative feedback will consist of a category (depends on the use-case of the chatbot),
            a type of issue, and some written comments. Admin users can view all feedback on a dedicated
            page. Sources (if part of the original response) will be included with the feedback submission.
          </p>
          <h3>Sources</h3>
          <p>
            If the chatbot references any files (uploaded by admin users), they will show up
            underneath the relevant message. Admin users have access to a portal to add or delete
            files. 
          </p>
          <h3>Session history</h3>
          <p>
            All conversations are saved and can be later accessed via {" "}
            <Link to="/chatbot/sessions">Sessions</Link>.
          </p>
        </HelpPanel>
      }
      documentIdentifier={documentIdentifier} // Pass documentIdentifier to BaseAppLayout
      toolsWidth={300}       
      content={
       <div>
      {/* <Chat sessionId={sessionId} /> */}
      
      <Chat sessionId={sessionId} documentIdentifier={documentIdentifier} />
      </div>
     }
    />    
  );
}
