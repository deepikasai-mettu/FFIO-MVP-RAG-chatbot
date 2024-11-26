import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button, Tabs, Spinner, SegmentedControl } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
import ReqNav from '../../components/req-nav';
import ReactMarkdown from 'react-markdown';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from '../../common/app-context';
import '../../styles/checklists.css';
import BackArrowIcon from "../../../public/images/back-arrow.jsx";
import { v4 as uuidv4 } from "uuid";

export interface SectionProps {
    title: string;
    content: string;
    isOpenDefault?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, content, isOpenDefault = true }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);
    const navigate = useNavigate();
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
  const navigate = useNavigate()
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
  const [selectedSegment, setSelectedSegment] = useState("seg-2"); // SegmentedControl state
  const getNOFOSummary = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };
    const navigate = useNavigate();
    const location = useLocation();
    const { documentIdentifier } = useParams();
    console.log("CHECKLIST IDENTIFIER: ", documentIdentifier);
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
            navigation={null}
            navigationHide={true}
            navigationOpen={false}
            onNavigationChange={() => {}}
            content={
                <SpaceBetween direction="vertical" size="xl">
                    <Box padding="m">
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '20px',
                                width: '100%',
                                marginBottom: '3rem',
                            }}
                        >
                            <Box>
                                <Button
                                    onClick={() => navigate('/landing-page/basePage')}
                                    variant="primary"
                                    aria-label="Return to Home Page"
                                    iconSvg={<BackArrowIcon />}
                                >
                                    Back to Home
                                </Button>
                            </Box>
                            <Box>
                                <SegmentedControl
                                    selectedId={selectedSegment}
                                    onChange={({ detail }) => {
                                        setSelectedSegment(detail.selectedId);
                                        if (detail.selectedId === "seg-1") {
                                            navigate('/landing-page/basePage');
                                        } else if (detail.selectedId === "seg-3") {
                                            navigate(linkUrl);
                                        }
                                    }}
                                    label="Choose segment"
                                    options={[
                                        { text: "(1) NOFO Select", id: "seg-1" },
                                        { text: "(2) Key Information", id: "seg-2" },
                                        { text: "(3) Draft Narrative", id: "seg-3" },
                                    ]}
                                />
                            </Box>
                            <Box>
                                <Button
                                    onClick={() => navigate(linkUrl)}
                                    variant="primary"
                                    aria-label="Open Settings"
                                    // iconSvg={<FaArrowRight />}
                                >
                                    Go to Chatbot
                                </Button>
                            </Box>
                        </div>
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
                                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px', maxWidth: '950px' }}>
                                    We've extracted the Eligibility Criteria, Required Documents, Project Narrative Components, and Key Deadlines for this grant.
                                </p>
                                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                                    Use the tabs below to navigate through each section.
                                </p>
                                <Tabs
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
                                <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
                                    When you're ready, use the side navigation bar to start drafting your project proposal.
                                </p>
                            </>
                        )}
                    </Box>
                </SpaceBetween>
            }
        />
    );
  return (
    <BaseAppLayout
      // navigation={<ReqNav documentIdentifier={documentIdentifier} />}
      navigation={null}
      navigationHide={true} // Completely hide the hamburger icon
      navigationOpen={false}
      onNavigationChange={() => { }} // Disable the hamburger toggle behavior
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
                marginBottom: "30px", // Space below the toolbar
              }}
            >
              {/* Left Button */}
              <Button
                onClick={() => navigate('/landing-page/basePage')}
                variant="primary"
                aria-label="Return to Home Page"
                iconSvg={<BackArrowIcon />}
              >
                Back to Home
              </Button>

              {/* Segmented Control */}
              <SegmentedControl
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
              />

              {/* Right Button */}
              <Button
                onClick={() => navigate(linkUrl)}
                variant="primary"
                aria-label="Open Settings"
              >
                Go to Chatbot
              </Button>
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



// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { Box, Header, SpaceBetween, Button, Tabs, Spinner, SegmentedControl } from '@cloudscape-design/components';
// import BaseAppLayout from '../../components/base-app-layout';
// import ReqNav from '../../components/req-nav';
// import ReactMarkdown from 'react-markdown';
// import { ApiClient } from "../../common/api-client/api-client";
// import { AppContext } from '../../common/app-context';
// import '../../styles/checklists.css';
// import BackArrowIcon from "../../../public/images/back-arrow.jsx";
// import { v4 as uuidv4 } from "uuid";

// export interface SectionProps {
//   title: string;
//   content: string;
//   isOpenDefault?: boolean;
// }

// const CollapsibleSection: React.FC<SectionProps> = ({ title, content, isOpenDefault = true }) => {
//   const [isOpen, setIsOpen] = useState(isOpenDefault);
//   const navigate = useNavigate()
//   const toggleSection = () => setIsOpen((prev) => !prev);

//   return (
//     <Box>
//       <Header variant="h2">
//         {title}
//         <Button
//           variant="icon"
//           iconName={isOpen ? 'angle-down' : 'angle-right'}
//           onClick={toggleSection}
//           ariaLabel={`Toggle ${title} Section`}
//         />
//       </Header>
//       {isOpen && (
//         <Box margin={{ top: 's' }}>
//           <ReactMarkdown>{content}</ReactMarkdown>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default function Checklists() {
//   const navigate = useNavigate()
//   const location = useLocation();
//   const { documentIdentifier } = useParams();
//   console.log("CHECKLIST IDENTIFIER: ", documentIdentifier)
//   const appContext = useContext(AppContext);
//   const apiClient = new ApiClient(appContext);
//   const [llmData, setLlmData] = useState({
//     grantName: '',
//     eligibility: '',
//     documents: '',
//     narrative: '',
//     deadlines: '',
//   });
//   const [isloading, setLoading] = useState(true);
//   const [selectedSegment, setSelectedSegment] = useState("seg-2"); // SegmentedControl state
//   const getNOFOSummary = async () => {
//     try{
//       console.log("document key: ", documentIdentifier);
//       const result = await apiClient.landingPage.getNOFOSummary(documentIdentifier);
//       console.log("result: ", result);
//       setLlmData({
//         grantName: result.data.GrantName,  // Set the grantName from JSON response
//         narrative: result.data.ProjectNarrativeSections.map(section => `- **${section.item}**: ${section.description}`).join('\n'),
//         eligibility: result.data.EligibilityCriteria.map(criterion => `- **${criterion.item}**: ${criterion.description}`).join('\n'),
//         documents: result.data.RequiredDocuments.map(doc => `- **${doc.item}**: ${doc.description}`).join('\n'),
//         deadlines: result.data.KeyDeadlines.map(deadline => `- **${deadline.item}**: ${deadline.description}`).join('\n'),
//       });
//     } catch (error) {
//       console.error("Error loading NOFO summary: ", error);
//     }finally {
//       setLoading(false);
//     }
//   } ;

//   const { documentUrl } = useParams<{ documentUrl: string }>();
//   useEffect(() => {
//     getNOFOSummary();
//   }, [documentUrl]);

//   const linkUrl = `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(documentIdentifier)}`;

//   return (
//     <BaseAppLayout
//       // navigation={<ReqNav documentIdentifier={documentIdentifier} />}
//       navigation={null}
//       navigationHide={true} // Completely hide the hamburger icon
//       navigationOpen={false}
//       onNavigationChange={() => {}} // Disable the hamburger toggle behavior
//       content={

//       <SpaceBetween direction="vertical" size="xl">
//       <Box padding="m">

// <div
//   style={{
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '20px', // Adjust spacing
//     width: '100%',
//     marginBottom: '1rem', // Adjust spacing
//   }}
// >
//   <Box>
//     <Button
//       onClick={() => navigate('/landing-page/basePage')}
//       variant="primary"
//       aria-label="Return to Home Page"
//       iconSvg={<BackArrowIcon />}
//     >
//       Back to Home
//     </Button>
//   </Box>

//   <Box>
//     <SegmentedControl
//       selectedId={selectedSegment}
//       onChange={({ detail }) => {
//         setSelectedSegment(detail.selectedId);
//         if (detail.selectedId === "seg-1") {
//           navigate('/landing-page/basePage');
//         } else if (detail.selectedId === "seg-3") {
//           navigate(linkUrl);
//         }
//       }}
//       label="Choose segment"
//       options={[
//         { text: "(1) NOFO Select", id: "seg-1" },
//         { text: "(2) Key Information", id: "seg-2" },
//         { text: "(3) Draft Narrative", id: "seg-3" },
//       ]}
//     />
//   </Box>

//   <Box>
//     <Button
//       onClick={() => navigate(linkUrl)}
//       variant="primary"
//       aria-label="Open Settings"
//     >
//       Go to Chatbot
//     </Button>
//   </Box>
// </div>



          
//         {/* </SpaceBetween> */}
//         {isloading ? (
//             <Box textAlign="center">
//               <Spinner size="large" />
//               <p>Loading...</p>
//             </Box>
//           ) : (
//             <>
//             <Header variant="h1">
//               <span style={{ color: '#000000' }}>Application Requirements for </span>
//               <span style={{ color: '#006ce1' }}>{llmData.grantName}</span>
//             </Header>
//               <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px', maxWidth: '950px', }}>
//               We've extracted the Project Narrative Components, Eligibility Criteria, Documents Required, and Key Deadlines for this grant. 
//               </p>
//               <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//               Use the tabs below to navigate through each section. 
//               </p>
//               {/* Tabs for Navigation */}
//               <Tabs
//                 tabs={[
//                   {
//                     label: "Project Narrative Components",
//                     id: "narrative",
//                     content: (
//                       <Box margin={{ top: 'm' }}>
//                       <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//                       The following sections must be included in the project narrative. Navigate to the chatbot through the toolbar for help crafting a narrative draft.
//                       </p>
      
//                       <ReactMarkdown className="custom-markdown">{llmData.narrative}</ReactMarkdown>
//                       </Box>
//                     ),
//                   },
//                   {
//                     label: "Eligibility Criteria",
//                     id: "eligibility",
//                     content: (
//                       <Box margin={{ top: 'm' }}>
//                       <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//                       Ensure you adhere to the extracted eligibility criteria before continuing with your application.
//                       </p>
//                         <ReactMarkdown className="custom-markdown">{llmData.eligibility}</ReactMarkdown>
//                       </Box>
//                     ),
//                   },
//                   {
//                     label: "Documents Required",
//                     id: "documents",
//                     content: (
//                       <Box margin={{ top: 'm' }}>
//                       <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//                       Include the following documents in your proposal.
//                       </p>
//                         <ReactMarkdown className="custom-markdown">{llmData.documents}</ReactMarkdown>
//                       </Box>
//                     ),
//                   },
//                   {
//                     label: "Key Deadlines",
//                     id: "deadlines",
//                     content: (
//                       <Box margin={{ top: 'm' }}>
//                       <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//                       Note the following key deadlines for this grant.
//                       </p>
//                         <ReactMarkdown className="custom-markdown">{llmData.deadlines}</ReactMarkdown>
//                       </Box>
//                     ),
//                   },
//                 ]}
//                 variant="default"
//               />
//               <p style={{ fontSize: '16px', color: '#555', marginTop: '10px', marginBottom: '20px' }}>
//               When you're ready, use the side navigation bar to start drafting your project proposal.
//               </p>
//             </>
//           )}
//         </Box>
//         </SpaceBetween>
//       }
//     />
//   );
// }