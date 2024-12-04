import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button, Tabs, Spinner, SegmentedControl } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
// import ReqNav from '../../components/req-nav';
import ReactMarkdown from 'react-markdown';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from '../../common/app-context';
import '../../styles/checklists.css';
import BackArrowIcon from "../../../public/images/back-arrow.jsx";
import ForwardArrowIcon from "../../../public/images/forward-arrow.jsx";
import { v4 as uuidv4 } from "uuid";

export interface SectionProps {
    title: string;
    content: string;
    isOpenDefault?: boolean;
}

const RightArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-arrow-right"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
    />
  </svg>
);

export default function Checklists() {
    const navigate = useNavigate();
    const location = useLocation();
    const { documentIdentifier } = useParams();
    const [searchParams] = useSearchParams();
    const folderParam = searchParams.get("folder") || documentIdentifier;
    
    console.log("Checklist - documentIdentifier:", documentIdentifier);
    console.log("Checklist - folderParam:", folderParam);

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
    const [selectedSegment, setSelectedSegment] = useState("seg-2");
    const [activeTabId, setActiveTabId] = useState("eligibility");

    useEffect(() => {
        // Get the hash from the URL (removing the # symbol)
        const hash = window.location.hash.replace('#', '');
        // If there's a valid hash that matches one of our tab IDs, set it as active
        if (["eligibility", "narrative", "documents", "deadlines"].includes(hash)) {
            setActiveTabId(hash);
        }
    }, [location]); // React to location changes

    const getNOFOSummary = async () => {
        try {
            console.log("document key: ", documentIdentifier);
            const result = await apiClient.landingPage.getNOFOSummary(documentIdentifier);
            console.log("result: ", result);
            setLlmData({
                grantName: result.data.GrantName,
                narrative: result.data.ProjectNarrativeSections.map(section => `- **${section.item}**: ${section.description}`).join('\n'),
                eligibility: result.data.EligibilityCriteria.map(criterion => `- **${criterion.item}**: ${criterion.description}`).join('\n'),
                documents: result.data.RequiredDocuments.map(doc => `- **${doc.item}**: ${doc.description}`).join('\n'),
                deadlines: result.data.KeyDeadlines.map(deadline => `- **${deadline.item}**: ${deadline.description}`).join('\n'),
            });
        } catch (error) {
            console.error("Error loading NOFO summary: ", error);
        } finally {
            setLoading(false);
        }
    };

    const { documentUrl } = useParams<{ documentUrl: string }>();
    useEffect(() => {
        getNOFOSummary();
    }, [documentUrl]);

    const linkUrl = `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(documentIdentifier)}`;

  return (
    <BaseAppLayout
      documentIdentifier={folderParam}
      content={

        <SpaceBetween direction="vertical" size="xl">
          <Box padding="m">

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem", // Spacing between items
                flexWrap: "wrap", // Ensure items wrap if the screen is too narrow
                marginTop: "15px",
                marginBottom: "0px", // Space below the toolbar
              }}
            >
              {/* Left Button */}
              {/* <Button
                onClick={() => navigate('/landing-page/basePage')}
                variant="primary"
                aria-label="Return to Home Page"
                iconSvg={<BackArrowIcon />}
              >
                Back to Home
              </Button> */}

              {/* Segmented Control */}
              {/* <SegmentedControl
                selectedId={selectedSegment}
                onChange={({ detail }) => {
                  setSelectedSegment(detail.selectedId);
                  if (detail.selectedId === "seg-1") {
                    navigate('/landing-page/basePage'); // Segment 1 takes you back to Home
                  } else if (detail.selectedId === "seg-3") {
                    navigate(linkUrl); // Segment 3 takes you to the Chatbot
                  }
                }}
                label="Choose segment"
                options={[
                  { text: "(1) NOFO Select", id: "seg-1" },
                  { text: "(2) Key Information", id: "seg-2" }, // Highlighted by default on this page
                  { text: "(3) Draft Narrative", id: "seg-3" },
                ]}
              /> */}

              {/* Right Button */}
              {/* <Button
                onClick={() => navigate(linkUrl)}
                variant="primary"
                aria-label="Open Settings"
                iconSvg={<RightArrowIcon />}
                iconAlign="right"
              >
                Go to Chatbot
              </Button> */}
            </div>


            {/* </SpaceBetween> */}
            {isloading ? (
              <Box textAlign="center">
                <Spinner size="large" />
                <p>Loading...</p>
              </Box>
            ) : (
              <>
                <Header variant="h1">
                  <span style={{ color: '#000000' }}>Application Requirements for </span>
                  <span style={{ color: '#006499' }}>{llmData.grantName}</span>
                </Header>
                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px', maxWidth: '950px', }}>
                  We've extracted the Eligibility Criteria, Required Documents, Project Narrative Components, and Key Deadlines for this grant.
                </p>
                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                  Use the tabs below to navigate through each section.
                </p>
                {/* Tabs for Navigation */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Horizontal centering
                    marginTop: "15px",
                    marginBottom: "10px",
                    width: "100%", // Ensures the container spans full width
                  }}
                >
                  <Tabs
                    activeTabId={activeTabId}
                    onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
                    tabs={[
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
                        label: "Required Documents",
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
                </div>
                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                  When you're ready, use navigation buttons above to start drafting your project proposal.
                </p>
              </>
            )}
          </Box>
        </SpaceBetween>
      }
    />
  );
}