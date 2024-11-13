import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button, Spinner } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
import ReqNav from '../../components/req-nav';
import ReactMarkdown from 'react-markdown';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from '../../common/app-context';

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
          <SpaceBetween size="l">
            {
              isloading ? (
                <Box textAlign='center'>
                  <Spinner size='large' />
                  <p>Loading...</p>
                  <p>If you've just uploaded a new NOFO for the first time, processing may take up to 5 minutes.</p>
                </Box>
              ) : (
                <>
                <Header variant="h1">Application Requirements for {llmData.grantName}</Header>
                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                  Review each section carefully to ensure compliance with NOFO guidelines.
                </p>
                  {/* Collapsible Sections */}
                  <CollapsibleSection
                    title="Project Narrative Components"
                    content=
                    {llmData.narrative}
                  />
                  <CollapsibleSection
                    title="Eligibility Criteria"
                    content={llmData.eligibility}
                  />
                  <CollapsibleSection
                    title="Documents Required"
                    content={llmData.documents}
                  />
                  <CollapsibleSection
                    title="Key Deadlines"
                    content={llmData.deadlines}
                  />
                </>
              )
            }

          </SpaceBetween>
        </Box>
      }
    />
  );
}