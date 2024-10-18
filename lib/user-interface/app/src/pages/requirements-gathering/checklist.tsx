import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
import ReqNav from '../../components/req-nav'; // Custom Navigation Component

export default function Checklists() {
  // State to manage visibility of sections
  const [isProjectNarrativeOpen, setProjectNarrativeOpen] = useState(false);
  const [isEligibilityOpen, setEligibilityOpen] = useState(false);
  const [isDocumentsOpen, setDocumentsOpen] = useState(false);
  const [isDeadlinesOpen, setDeadlinesOpen] = useState(false);
  const { documentUrl } = useParams<{ documentUrl: string }>();
  const [llmData, setLlmData] = useState({
    eligibility: '',
    documents: '',
    narrative: '',
    deadlines: '',
  });



  // Toggle section visibility
  const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  return (
    <BaseAppLayout
      navigation={<ReqNav />}
      content={
        <Box padding="m">
          <SpaceBetween size="l">
            <Header variant="h1">Requirements for Selected Grant Name</Header>
            <div>
            <h1>Requirements Gathering Page</h1>
            <p>You have selected the document:</p>
            <pre>{decodeURIComponent(documentUrl)}</pre>
            {/* Add your requirements gathering content here */}
            </div>
            {/* Project Narrative Section */}
            <Box>
              <Header variant="h2">Project Narrative Components</Header>
              <Button
                variant="icon"
                iconName={isProjectNarrativeOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setProjectNarrativeOpen)}
                ariaLabel="Toggle Project Narrative Section"
              />
              {isProjectNarrativeOpen && (
                <Box margin={{ top: 's' }}>{llmData.narrative}</Box>
              )}
            </Box>

            {/* Eligibility Criteria Section */}
            <Box>
              <Header variant="h2">Eligibility Criteria</Header>
              <Button
                variant="icon"
                iconName={isEligibilityOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setEligibilityOpen)}
                ariaLabel="Toggle Eligibility Section"
              />
              {isEligibilityOpen && (
                <Box margin={{ top: 's' }}>{llmData.eligibility}</Box>
              )}
            </Box>

            {/* Documents Required Section */}
            <Box>
              <Header variant="h2">Documents Required</Header>
              <Button
                variant="icon"
                iconName={isDocumentsOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setDocumentsOpen)}
                ariaLabel="Toggle Documents Section"
              />
              {isDocumentsOpen && (
                <Box margin={{ top: 's' }}>{llmData.documents}</Box>
              )}
            </Box>

            {/* Key Deadlines Section */}
            <Box>
              <Header variant="h2">Key Deadlines</Header>
              <Button
                variant="icon"
                iconName={isDeadlinesOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setDeadlinesOpen)}
                ariaLabel="Toggle Deadlines Section"
              />
              {isDeadlinesOpen && (
                <Box margin={{ top: 's' }}>{llmData.deadlines}</Box>
              )}
            </Box>
          </SpaceBetween>
        </Box>
      }
    />
  );
}