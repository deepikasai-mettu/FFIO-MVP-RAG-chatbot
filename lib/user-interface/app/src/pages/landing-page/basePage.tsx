import React, { useContext, useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import {
  Header,
  SpaceBetween,
  Cards,
  Select,
  Container,
  Link,
  Button,
} from '@cloudscape-design/components';
import { ApiClient } from '../../common/api-client/api-client';
import { AppContext } from '../../common/app-context';

export default function Welcome({ theme }) {
  console.log('entering base page');

  // **State Variables**
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recentlyViewedNOFOs, setRecentlyViewedNOFOs] = useState([]);

  // **Context and Navigation**
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const navigate = useNavigate();

  // **Styles**
  // Styles for numbered steps
  const numberedStepsContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0 20px', // Use padding for responsive spacing
    flexWrap: 'wrap', // Allows steps to wrap on smaller screens
  };

  const stepContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    flex: '1 1 300px', // Flexible width with a minimum
    padding: '10px'
  };

  const numberBubbleStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    width: '70px',
    height: '70px',
    backgroundColor: '#0073e6',
    color: 'white',
    borderRadius: '50%',
    fontSize: '50px'
  };

  const stepContentStyle: CSSProperties = {
    maxWidth: '800px',
    marginLeft: '20px',
    fontSize: '16px',
  };

  const stepContentH2Style: CSSProperties = {
    marginTop: '0',
    fontSize: '24px',
    marginBottom: '30px',
  };

  const stepContentUlStyle: CSSProperties = {
    paddingLeft: '1px',
  };

  const stepContentLiStyle: CSSProperties = {
    marginBottom: '10px',
  };

  // Common panel style for "Select a NOFO" and "Recently Viewed NOFOs"
  const panelStyle: CSSProperties = {
    flex: '1 1 300px', // Allows flexibility with a minimum width
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f0f4f8',
    border: '1px solid #d1e3f0',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    maxHeight: 'none',
    overflowY: 'auto',
  };

  // Additional Resources Panel Style
  const additionalResourcesStyle: CSSProperties = {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f0f4f8',
    border: '1px solid #d1e3f0',
    marginBottom: '40px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: '800px', // Adjust as needed
  };

  // Feedback Panel Style
  const feedbackPanelStyle: CSSProperties = {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f0f4f8',
    border: '1px solid #d1e3f0',
    marginBottom: '40px',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    width: '100%',
    maxWidth: '800px', // Adjust as needed
  };

  // Affiliations Section Style
  const affiliationSectionStyle: CSSProperties = {
    backgroundColor: '#161d26',
    padding: '10px',
    marginTop: '40px',
    width: '100%',
  };

  const affiliationContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 20px', // Add padding for small screens
  };

  // **Admin Section Styles**
  const adminContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: '50px',
    marginLeft: '40px',
    flexWrap: 'wrap', // Allows wrapping on smaller screens
  };

  const adminTextStyle: CSSProperties = {
    fontSize: '16px',
    fontStyle: 'italic',
    color: '#555',
    margin: '0 25px 10px 0', // Adjust margins for responsiveness
    textAlign: 'left',
    width: '100%',
    maxWidth: '400px',
  };

  const adminButtonStyle: CSSProperties = {
    minWidth: '150px',
    width: '100%', // Make button full width on smaller screens
    maxWidth: '200px', // Optional: set a max width
  };

  // **Yellow Background Panel for Numbered Steps**
  const stepsBackgroundStyle: CSSProperties = {
    backgroundColor: '#FFEC8E', // Bright yellow '#FBF585'
    padding: '20px',
    marginBottom: '60px',
    width: '100%',
    boxSizing: 'border-box', // Ensure padding doesn't exceed maxWidth
  };

  // **Effect Hooks**
  // Check for admin status
  useEffect(() => {
    (async () => {
      try {
        const result = await Auth.currentAuthenticatedUser();
        if (!result || Object.keys(result).length === 0) {
          console.log('Signed out!');
          Auth.signOut();
          return;
        }
        const adminRole =
          result?.signInUserSession?.idToken?.payload['custom:role'];
        if (adminRole && adminRole.includes('Admin')) {
          setIsAdmin(true); // Set admin status to true if user has admin role
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
      }
    })();
  }, []);

  // Load recently viewed NOFOs from localStorage
  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem('recentlyViewedNOFOs')) || [];
    setRecentlyViewedNOFOs(storedHistory);
  }, []);

  // Fetch NOFO documents from S3
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        await getNOFOListFromS3();
      } catch (error) {
        console.error('Failed to fetch NOFO documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  // **Functions**
  // Get NOFO list from S3
  const getNOFOListFromS3 = async () => {
    setLoading(true);
    try {
      const result = await apiClient.landingPage.getNOFOs();
      const folders = result.folders || [];
      setDocuments(
        folders.map((document) => ({
          label: document,
          value: document + '/',
        }))
      );
    } catch (error) {
      console.error('Error retrieving NOFOs: ', error);
    }
    setLoading(false);
  };

  // Handle NOFO selection
  const handleNOFOSelect = (href, selectedNOFO) => {
    const now = new Date().toLocaleString();
    const updatedHistory = [
      {
        label: selectedNOFO.label,
        value: selectedNOFO.value,
        lastViewed: now,
      },
      ...recentlyViewedNOFOs.filter(
        (nofo) => nofo.value !== selectedNOFO.value
      ),
    ].slice(0, 3);

    setRecentlyViewedNOFOs(updatedHistory);
    localStorage.setItem(
      'recentlyViewedNOFOs',
      JSON.stringify(updatedHistory)
    );
    navigate(href);
  };

  // Upload a new NOFO (Admin functionality)
  const uploadNOFO = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.onchange = async (event) => {
      const file = fileInput.files[0];

      if (!file) return;

      try {
        const documentName = file.name.split('.').slice(0, -1).join('');
        let newFilePath;
        if (file.type === 'text/plain') {
          newFilePath = `${documentName}/NOFO-File-TXT`;
        } else if (file.type === 'application/pdf') {
          newFilePath = `${documentName}/NOFO-File-PDF`;
        } else {
          newFilePath = `${documentName}/NOFO-File`;
        }

        const signedUrl = await apiClient.landingPage.getUploadURL(
          newFilePath,
          file.type
        );
        await apiClient.landingPage.uploadFileToS3(signedUrl, file);

        alert('File uploaded successfully!');
        await getNOFOListFromS3();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload the file.');
      }
    };

    fileInput.click();
  };

  // Navigate to checklists
  const goToChecklists = () => {
    if (selectedDocument) {
      const summaryFileKey = `${selectedDocument.value}`;
      navigate(
        `/landing-page/basePage/checklists/${encodeURIComponent(
          summaryFileKey
        )}`
      );
    }
  };

  // **Components**
  // HistoryPanel component
  const HistoryPanel = () => (
    <div
      style={{
        ...panelStyle,
        minWidth: '315px',
        maxWidth: '315px',
      }}
    >
      <h2 style={{ fontSize: '24px', lineHeight: '1' }}>
        Recently Viewed NOFOs
      </h2>
      <SpaceBetween size="s">
        {recentlyViewedNOFOs.length > 0 ? (
          recentlyViewedNOFOs.map((nofo, index) => (
            <div
              key={index}
              style={{ padding: '10px', borderBottom: '1px solid #e1e4e8' }}
            >
              <Link
                onFollow={() =>
                  handleNOFOSelect(
                    `/landing-page/basePage/checklists/${encodeURIComponent(
                      nofo.value
                    )}`,
                    nofo
                  )
                }
              >
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {nofo.label}
                </span>
              </Link>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                <span>Last viewed: {nofo.lastViewed}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6c757d', fontSize: '16px' }}>
            You haven’t viewed any NOFOs recently. Select or upload a document
            at the panel to the left to get started.
          </p>
        )}
      </SpaceBetween>
    </div>
  );

  // **Render**
  return (
    <Container>
      {/* Header with logo and title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap', // Allow wrapping on small screens
            justifyContent: 'center',
          }}
        >
          <img
            src="/images/stateseal-color.png"
            alt="State Seal"
            style={{
              width: '65px',
              height: '65px',
              marginRight: '10px',
            }}
          />
          <h1 style={{ fontSize: '60px', textAlign: 'center' }}>GrantWell</h1>
        </div>
      </div>

      <p
        style={{
          fontSize: '24px',
          marginBottom: '10px',
          marginTop: '10px',
          columnCount: 1,
          columnGap: '10px',
          textAlign: 'center',
        }}
      >
        GrantWell is an AI tool that helps Massachusetts communities secure
        federal grants.
      </p>

      <p
        style={{
          fontSize: '24px',
          marginBottom: '50px',
          marginTop: '10px',
          columnCount: 1,
          columnGap: '10px',
          textAlign: 'center',
        }}
      >
        There are three main pages to navigate:
      </p>

      {/* <hr style={{ border: 'none', borderTop: '1px solid #000' }} /> */}

      {/* Numbered Steps */}
      <div style={stepsBackgroundStyle}>
        <div style={numberedStepsContainerStyle}>
          {/* Step 1 */}
          <div style={stepContainerStyle}>
            <div style={numberBubbleStyle}>1</div>
            <div style={stepContentStyle}>
              <h2 style={stepContentH2Style}>Home</h2>
              <ul style={stepContentUlStyle}>
                <li style={stepContentLiStyle}>
                  <strong>Select a NOFO</strong> in the dropdown below to view its key information.
                </li>
                <li style={stepContentLiStyle}>
                  <strong>Quickly access</strong> the key info of recently viewed NOFOs.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div style={stepContainerStyle}>
            <div style={numberBubbleStyle}>2</div>
            <div style={stepContentStyle}>
              <h2 style={stepContentH2Style}>View Key Information</h2>
              <ul style={stepContentUlStyle}>
                <li style={stepContentLiStyle}>
                  <strong>Review important info</strong> of the NOFO you selected on this home page.
                </li>
                <li style={stepContentLiStyle}>
                  <strong>Start your narrative</strong> by clicking "Start a Proposal" in the side menu.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div style={stepContainerStyle}>
            <div style={numberBubbleStyle}>3</div>
            <div style={stepContentStyle}>
              <h2 style={stepContentH2Style}>Draft Your Narrative</h2>
              <ul style={stepContentUlStyle}>
                <li style={stepContentLiStyle}>
                  <strong>Utilize our AI chatbot</strong> to develop your narrative,
                  section by section.
                </li>
                <li style={stepContentLiStyle}>
                  <strong>Need a different grant?</strong> Return to the home page
                  and select a new NOFO.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* <hr
        style={{
          border: 'none',
          borderTop: '1px solid #000',
          marginTop: '0px',
          marginBottom: '60px',
        }}
      /> */}

      {/* Main Content */}
      <SpaceBetween size="xl">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '40px',
            marginBottom: '40px',
            width: '100%',
            padding: '0 50px', // Add 50px padding on left and right
            boxSizing: 'border-box',
            flexWrap: 'wrap', // Allows wrapping on smaller screens
            justifyContent: 'center', // Centers items when wrapped
          }}
        >
          {/* "Select a NOFO" Tile */}
          <div style={panelStyle}>
            <h2
              style={{
                fontSize: '24px',
                marginBottom: '25px',
                lineHeight: '1',
              }}
            >
              Select a NOFO (Notice of Funding Opportunity) Document
            </h2>

            <ol
              style={{
                fontSize: '16px',
                color: '#555',
                marginBottom: '40px',
                paddingLeft: '40px',
              }}
            >
              <li>Select a NOFO from the dropdown</li>
              <li>
                Click 'View Key Requirements' to review primary information from
                the NOFO
              </li>
            </ol>

            {isAdmin && (
              <div style={adminContainerStyle}>
                <p style={adminTextStyle}>
                  ADMIN: Click "Upload New NOFO" to upload a document
                  <br />
                  to the dropdown that you can then select and review
                </p>
                <Button
                  onClick={uploadNOFO}
                  variant="primary"
                  aria-label="Upload New NOFO"
                  // style={adminButtonStyle} // was being problematic
                >
                  Upload New NOFO
                </Button>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '20px',
                flexWrap: 'wrap', // Allows buttons to stack on small screens
              }}
            >
              <div style={{ width: '100%', maxWidth: '70%', marginRight: '30px' }}>
                <Select
                  selectedOption={selectedDocument}
                  onChange={({ detail }) =>
                    setSelectedDocument(detail.selectedOption)
                  }
                  options={documents}
                  placeholder="Select a document"
                  filteringType="auto"
                  aria-label="Select a NOFO document"
                />
              </div>
              <div style={{ width: '100%', maxWidth: '250px' }}>
                <Button
                  onClick={() =>
                    handleNOFOSelect(
                      `/landing-page/basePage/checklists/${encodeURIComponent(
                        selectedDocument.value
                      )}`,
                      selectedDocument
                    )
                  }
                  disabled={!selectedDocument}
                  variant="primary"
                  aria-label="View Key Requirements"
                >
                  View Key Requirements
                </Button>
              </div>
            </div>
          </div>

          {/* "Recently Viewed NOFOs" Tile */}
          <HistoryPanel />
        </div>

        {/* "Additional Resources" Panel */}
        <div
          style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f0f4f8',
            border: '1px solid #d1e3f0',
            marginBottom: '40px',
            marginLeft: '50px',
            marginRight: '50px',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '40px' }}>Additional Resources</h2>
          <Cards
            cardDefinition={{
              header: (item) => (
                <div
                  style={{
                    height: '60px', // Fixed height for the header
                    overflow: 'hidden', // Hide overflow if title exceeds height
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Link href={item.href} external fontSize="heading-m">
                    {item.name}
                  </Link>
                </div>
              ),
              sections: [
                {
                  content: (item) => (
                    <div style={{ minHeight: '200px' }}>
                      <img
                        src={item.img}
                        alt={item.altText}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '20px',
                        }}
                      />
                    </div>
                  ),
                },
                {
                  content: (item) => (
                    <div style={{ fontSize: '16px', color: '#555' }}>
                      {item.description}
                    </div>
                  ),
                },
              ],
            }}
            cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 3 }]}
            items={[
              {
                name: 'Register for Federal Funds Partnership Meetings',
                external: true,
                href:
                  'https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl',
                img: '/images/Welcome/massFlag.png',
                altText: 'The Massachusetts state flag waving in the wind',
                description:
                  'Stay updated on funding opportunities by joining our monthly sessions.',
              },
              {
                name: 'Federal Grant Application Resources',
                external: true,
                href:
                  'https://www.mass.gov/lists/federal-funds-grant-application-resources',
                img: '/images/Welcome/resources.png',
                altText:
                  'Skyline of downtown Boston at sunset, featuring historic and modern buildings',
                description:
                  'Access categorized grant resources for streamlined applications.',
              },
              {
                name: 'Federal Grant Finder',
                external: true,
                href: 'https://www.usdigitalresponse.org/grant/grant-finder',
                img: '/images/Welcome/grantFinder.png',
                altText:
                  'Animated illustration of four characters celebrating federal grant funding, holding a check, coins, and a magnifying glass',
                description:
                  'Enhanced search and collaboration tools to optimize access to grants.',
              },
            ]}
          />
        </div>

        {/* Feedback Panel */}
        <div
          style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f0f4f8',
            border: '1px solid #d1e3f0',
            marginBottom: '60px',
            marginLeft: '50px',
            marginRight: '50px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '24px' }}>We Value Your Feedback!</h2>

          <p style={{ fontSize: '16px', color: '#555' }}>
            Help us make GrantWell better by sharing your thoughts and suggestions.
          </p>

          <div style={{ marginTop: '20px' }}>
            <Button
              onClick={() => window.open('https://forms.gle/M2PHgWTVVRrRubpc7', '_blank')}
              variant="primary"
              aria-label="Open Feedback Form"
            >
              Open Feedback Form
            </Button>
          </div>
        </div>

      </SpaceBetween>

      {/* Affiliations Section */}
      <div
        style={{
          backgroundColor: '#161d26',
          padding: '10px',
          marginBlockEnd: '-50px',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src="/images/burnesLogo.png"
            alt="Burnes Center Logo"
            style={{ width: '300px' }}
          />
        </div>
      </div>
    </Container>
  );
}
