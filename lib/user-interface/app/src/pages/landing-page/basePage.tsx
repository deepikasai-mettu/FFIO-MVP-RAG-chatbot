import React, { useContext, useState, useEffect, CSSProperties, useRef} from 'react';
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
  // Numbered steps container style
const numberedStepsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '0 20px',
  flexWrap: 'wrap',
};

// Step container style
const stepContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '1 1 300px',
  padding: '10px',
  margin: '0 20px', // Add horizontal margins to space out steps
};

// Number bubble style remains the same
const numberBubbleStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  width: '60px',
  height: '60px',
  backgroundColor: '#0073e6',
  color: 'white',
  borderRadius: '50%',
  fontSize: '40px'
};

// Step heading style
const stepContentH2Style: CSSProperties = {
  marginTop: '15px', // Space between number bubble and text
  fontSize: '24px',
  marginBottom: '0',
  textAlign: 'center',
};

  // Common panel style for "Select a NOFO" and "Recently Viewed NOFOs"
  const panelStyle: CSSProperties = {
    flex: '1 1 300px', // Allows flexibility with a minimum width
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#cfdfe8',
    border: '1px solid #d1e3f0',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    maxHeight: 'none',
    overflowY: 'auto',
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
    backgroundColor: '#FFEDBF', // this is a light orange rn 
    padding: '20px',
    marginBottom: '60px',
    width: '100%',
    boxSizing: 'border-box', // Ensure padding doesn't exceed maxWidth
  };

  const selectNOFORef = useRef(null);

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
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
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

      {/* Numbered Steps */}
      <div style={stepsBackgroundStyle}>
    <div style={numberedStepsContainerStyle}>
      {/* Step 1 */}
      <div style={stepContainerStyle}>
        <div style={numberBubbleStyle}>1</div>
        <h2 style={stepContentH2Style}>Select a NOFO</h2>
      </div>

      {/* Step 2 */}
      <div style={stepContainerStyle}>
        <div style={numberBubbleStyle}>2</div>
        <h2 style={stepContentH2Style}>View Key Information</h2>
      </div>

      {/* Step 3 */}
      <div style={stepContainerStyle}>
        <div style={numberBubbleStyle}>3</div>
        <h2 style={stepContentH2Style}>Draft Your Narrative</h2>
      </div>
    </div>
  </div>


      {/* Main Content */}

      {/* <div ref={selectNOFORef}></div> */}

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
          <div style={panelStyle} ref={selectNOFORef}>
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
            backgroundColor: '#cfdfe8',
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
            backgroundColor: '#cfdfe8',
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
