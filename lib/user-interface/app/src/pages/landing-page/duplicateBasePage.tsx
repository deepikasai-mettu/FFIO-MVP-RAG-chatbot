import React, { useContext, useState, useEffect, CSSProperties, useRef } from 'react';
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
  const headerContainerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap", // Wraps on smaller screens
    marginBottom: "40px",
  };

  const logoTitleStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "15px",
  };

  const descriptionStyle: CSSProperties = {
    flex: "1 1 auto",
    maxWidth: "400px",
    textAlign: "center",
    fontSize: "22px",
    lineHeight: "1.3",
  };

  const logoStyle: CSSProperties = {
    width: "65px",
    height: "65px",
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
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // 2 columns
        gap: "25px", // Space between grid items
        width: "100vw", // Full screen width
        margin: "0 auto", // Center grid if needed
        padding: "20px", // Optional padding for visual spacing
        boxSizing: "border-box", // Include padding in the width calculation
      }}

    >
      <h2 style={{ gridColumn: "span 2", fontSize: "24px", lineHeight: "1", textAlign: "center" }}>
        Recently Viewed NOFOs
      </h2>
      {recentlyViewedNOFOs.length > 0 ? (
        recentlyViewedNOFOs.slice(0, 4).map((nofo, index) => (
          <div
            key={index}
            style={{
              padding: "15px",
              border: "1px solid #e1e4e8",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Link
              onFollow={() =>
                handleNOFOSelect(
                  `/landing-page/basePage/checklists/${encodeURIComponent(nofo.value)}`,
                  nofo
                )
              }
            >
              <span style={{ fontSize: "18px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                {nofo.label}
              </span>
            </Link>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              <span>Last viewed: {nofo.lastViewed}</span>
            </div>
          </div>
        ))
      ) : (
        <p
          style={{
            gridColumn: "span 2",
            color: "#6c757d",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          You haven’t viewed any NOFOs recently. Select or upload a document at the panel to get started.
        </p>
      )}
    </div>
  );

  // Reusable InfoBanner Component
const InfoBanner = ({ 
  title, 
  description, 
  buttonText = '', 
  buttonAction = null, 
  imageSrc = null, // Default to null if not provided
  imageAlt = '',
}) => (
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
        alignItems: 'center',
        flexDirection: 'row',
        height: '120px',
        gap: '25px',
        marginTop: '15px',
        marginBottom: '15px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <h1 style={{ fontSize: '30px', margin: 1, color: '#fff' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#fff' }}>{description}</p>
      </div>
      {buttonText && buttonAction && (
        <Button onClick={buttonAction} variant="primary" aria-label={buttonText}>
          {buttonText}
        </Button>
      )}
      {imageSrc && (
        <img src={imageSrc} alt={imageAlt} style={{ width: '300px' }} />
      )}
    </div>
  </div>
);

  // **Render**
  return (
    <Container>
      <div
        style={{
          maxWidth: "950px", // Set a max width for the page
          margin: "0 auto", // Center the content horizontally
          padding: "0 40px", // Add padding to the sides (adjust as needed)
        }}
      >
        {/* Header with logo and title */}
        {/* Header Section */}
        <div style={headerContainerStyle}>
          {/* Logo and Title */}
          <div style={logoTitleStyle}>
            <img
              src="/images/stateseal-color.png"
              alt="State Seal"
              style={logoStyle}
            />
            <h1 style={{ fontSize: "60px", margin: 0 }}>GrantWell</h1>
          </div>

          {/* Description */}
          <div style={descriptionStyle}>
            <p>
              An AI tool to help Massachusetts communities secure federal grants
            </p>
          </div>
        </div>


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

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '25px',
            marginTop: "20px",
            marginBottom: '40px',
            width: '100%',
            padding: '0 50px', // Add 50px padding on left and right
            boxSizing: 'border-box',
            flexWrap: 'wrap', // Allows wrapping on smaller screens
            justifyContent: 'center', // Centers items when wrapped
          }}
        >
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
            aria-label="Start Chat"
          >
            Start Chat
          </Button>

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

            {/* "Recently Viewed NOFOs" Tile */}
            <HistoryPanel />
          </div>

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
          </SpaceBetween>

        {/* Feedback Section */}
        <InfoBanner
          title="We Value Your Feedback!"
          description="Help us make GrantWell better by sharing your thoughts and suggestions."
          buttonText="Open Feedback Form"
          buttonAction={() =>
            window.open('https://forms.gle/M2PHgWTVVRrRubpc7', '_blank')
          }
        />

        {/* Affiliations Section */}
        <InfoBanner
          title="Our Affiliations"
          description="GrantWell is proudly owned by the Burnes Center for Social Change."
          imageSrc="/images/burnesLogo.png"
          imageAlt="Burnes Center Logo"
        />
      </div>
    </Container>
  );
}
