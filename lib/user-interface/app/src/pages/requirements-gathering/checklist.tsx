import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button, Tabs, Spinner } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
import ReqNav from '../../components/req-nav';
import ReactMarkdown from 'react-markdown';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from '../../common/app-context';
import '../../styles/checklists.css';

export interface SectionProps {
  title: string;
  content: string;
  isOpenDefault?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, content, isOpenDefault = true }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const toggleSection = () => setIsOpen((prev) => !prev);

  return (
    <Box>
      <Header variant="h2">
        {title}
        <Button
          variant="icon"
          iconName={isOpen ? 'angle-down' : 'angle-right'}
          onClick={toggleSection}
          ariaLabel={`Toggle ${title} Section`}
        />
      </Header>
      {isOpen && (
        <Box margin={{ top: 's' }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};

export default function Checklists() {
  const location = useLocation();
  const { documentIdentifier } = useParams();
  console.log("CHECKLIST IDENTIFIER: ", documentIdentifier)
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const [llmData, setLlmData] = useState({
    grantName: '',
    eligibility: '',
    documents: '',
    narrative: '',
    deadlines: '',
  });
  const [isloading, setLoading] = useState(true);
  const getNOFOSummary = async () => {
    try{
      console.log("document key: ", documentIdentifier);
      const result = await apiClient.landingPage.getNOFOSummary(documentIdentifier);
      console.log("result: ", result);
      setLlmData({
        grantName: result.data.GrantName,  // Set the grantName from JSON response
        narrative: result.data.ProjectNarrativeSections.map(section => `- **${section.item}**: ${section.description}`).join('\n'),
        eligibility: result.data.EligibilityCriteria.map(criterion => `- **${criterion.item}**: ${criterion.description}`).join('\n'),
        documents: result.data.RequiredDocuments.map(doc => `- **${doc.item}**: ${doc.description}`).join('\n'),
        deadlines: result.data.KeyDeadlines.map(deadline => `- **${deadline.item}**: ${deadline.description}`).join('\n'),
      });
    } catch (error) {
      console.error("Error loading NOFO summary: ", error);
    }finally {
      setLoading(false);
    }
  } ;

  const { documentUrl } = useParams<{ documentUrl: string }>();
  useEffect(() => {
    getNOFOSummary();
  }, [documentUrl]);

  return (
    <BaseAppLayout
      navigation={<ReqNav documentIdentifier={documentIdentifier} />}
      content={
        <Box padding="m">
          {isloading ? (
            <Box textAlign="center">
              <Spinner size="large" />
              <p>Loading...</p>
            </Box>
          ) : (
            <>
            <Header variant="h1">
              <span style={{ color: '#000000' }}>Application Requirements for </span>
              <span style={{ color: '#006ce1' }}>{llmData.grantName}</span>
            </Header>
              <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px', maxWidth: '950px', }}>
              We've extracted the Project Narrative Components, Eligibility Criteria, Documents Required, and Key Deadlines for this grant. 
              </p>
              <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
              Use the tabs below to navigate through each section. 
              </p>
              {/* Tabs for Navigation */}
              <Tabs
                tabs={[
                  {
                    label: "Project Narrative Components",
                    id: "narrative",
                    content: (
                      <Box margin={{ top: 'm' }}>
                      <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                      The following sections must be included in the project narrative. Navigate to the chatbot through the toolbar for help crafting a narrative draft.
                      </p>
      
                      <ReactMarkdown className="custom-markdown">{llmData.narrative}</ReactMarkdown>
                      </Box>
                    ),
                  },
                  {
                    label: "Eligibility Criteria",
                    id: "eligibility",
                    content: (
                      <Box margin={{ top: 'm' }}>
                      <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                      Ensure you adhere to the extracted eligibility criteria before continuing with your application.
                      </p>
                        <ReactMarkdown className="custom-markdown">{llmData.eligibility}</ReactMarkdown>
                      </Box>
                    ),
                  },
                  {
                    label: "Documents Required",
                    id: "documents",
                    content: (
                      <Box margin={{ top: 'm' }}>
                      <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                      Include the following documents in your proposal.
                      </p>
                        <ReactMarkdown className="custom-markdown">{llmData.documents}</ReactMarkdown>
                      </Box>
                    ),
                  },
                  {
                    label: "Key Deadlines",
                    id: "deadlines",
                    content: (
                      <Box margin={{ top: 'm' }}>
                      <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                      Note the following key deadlines for this grant.
                      </p>
                        <ReactMarkdown className="custom-markdown">{llmData.deadlines}</ReactMarkdown>
                      </Box>
                    ),
                  },
                ]}
                variant="default"
              />
              <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
              When you're ready, use the side navigation bar to start drafting your project proposal.
              </p>
            </>
          )}
        </Box>
      }
    />
  );
}