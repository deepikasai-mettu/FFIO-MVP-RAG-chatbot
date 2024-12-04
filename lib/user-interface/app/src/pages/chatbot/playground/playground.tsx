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
        <HelpPanel 
          //header={<Header variant="h3" color="#2E2E2E">Welcome to the GrantWell chatbot interface!</Header>}
          header = {<h3 style={{ fontSize: '24px', display: 'inline', color: '#006499' }}>Welcome to the GrantWell chatbot interface!</h3>}
        
        >
          <div style={{ color: '#006499' }}>
            <p>
              The purpose of this chatbot is to prompt you through the project narrative section of your grant. 
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
              You can also provide links to relevant sites or articles pertaining to your organization or project goals.
            </p>
            <h3 style={{ fontSize: '24px', display: 'inline', color: '#006499' }}>Sources</h3>
            <p>
              If the chatbot references any files you've uploaded, they will show up
              underneath the relevant message. Add or delete files through the "upload data" button in the other toolbar.
            </p>
            <h3 style={{ fontSize: '24px', display: 'inline', color: '#006499' }}>Session history</h3>
            <p>
              All conversations are saved and can be later accessed via {" "}
              <Link to="/chatbot/sessions" style={{ color: '#006499' }}>Sessions</Link>.
            </p>
          </div>
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
