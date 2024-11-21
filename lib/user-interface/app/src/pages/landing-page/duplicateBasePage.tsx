import { useContext, useState, useEffect } from 'react';
import { ApiClient } from '../../common/api-client/api-client';
import { AppContext } from '../../common/app-context';
import {
  Header,
  SpaceBetween,
  Cards,
  Select,
  Container,
  Link,
  Button,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

export default function Welcome({ theme }) {
  console.log('entering base page');

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recentlyViewedNOFOs, setRecentlyViewedNOFOs] = useState([]);
  const navigate = useNavigate();

  // Define styles for the numbered steps
  const numberedStepsContainerStyle = {
    display: 'flex',
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    // flexWrap: 'wrap',
  };

  const stepContainerStyle = {
    display: 'flex',
    // flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: '0px',
    flex: '1 1 30%',
    // boxSizing: 'border-box',
    padding: '10px',
  };

  const numberBubbleStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    width: '70px',
    height: '70px',
    backgroundColor: '#0073e6',
    color: 'white',
    borderRadius: '50%',
    fontSize: '50px',
    marginRight: '20px',
  };

  const stepContentStyle = {
    maxWidth: '800px',
    marginLeft: '20px',
  };

  const stepContentH2Style = {
    marginTop: '0',
  };

  const stepContentUlStyle = {
    paddingLeft: '1px',
  };

  const stepContentLiStyle = {
    marginBottom: '10px',
  };

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
        const adminRole = result?.signInUserSession?.idToken?.payload['custom:role'];
        if (adminRole && adminRole.includes('Admin')) {
          setIsAdmin(true); // Set admin status to true if user has admin role
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('recentlyViewedNOFOs')) || [];
    setRecentlyViewedNOFOs(storedHistory);
  }, []);

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

  const handleNOFOSelect = (href, selectedNOFO) => {
    const now = new Date().toLocaleString();
    const updatedHistory = [
      {
        label: selectedNOFO.label,
        value: selectedNOFO.value,
        lastViewed: now,
        viewCount:
          (recentlyViewedNOFOs.find((nofo) => nofo.value === selectedNOFO.value)?.viewCount ||
            0) + 1,
      },
      ...recentlyViewedNOFOs.filter((nofo) => nofo.value !== selectedNOFO.value),
    ].slice(0, 3);

    setRecentlyViewedNOFOs(updatedHistory);
    localStorage.setItem('recentlyViewedNOFOs', JSON.stringify(updatedHistory));
    navigate(href);
  };

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
}; // Close the uploadNOFO function here
    

  const goToChecklists = () => {
    if (selectedDocument) {
      const summaryFileKey = `${selectedDocument.value}`;
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(summaryFileKey)}`);
    }
  };

  // HistoryPanel component
  const HistoryPanel = () => (
    <div
      style={{
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#f0f4f8',
        border: '1px solid #d1e3f0',
      }}
    >
      <h2 style={{ fontSize: '25px', lineHeight: '1' }}>Recently Viewed NOFOs</h2>
      <SpaceBetween size="xs">
        {recentlyViewedNOFOs.length > 0 ? (
          recentlyViewedNOFOs.map((nofo, index) => (
            <div
              key={index}
              style={{ padding: '10px', borderBottom: '1px solid #e1e4e8' }}
            >
              <Link
                onFollow={() =>
                  handleNOFOSelect(
                    `/landing-page/basePage/checklists/${encodeURIComponent(nofo.value)}`,
                    nofo
                  )
                }
              >
                <span style={{ fontSize: '17px', fontWeight: 'bold' }}>{nofo.label}</span>
              </Link>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                <span>Last viewed: {nofo.lastViewed}</span>
                {/* <br />
                <span>View count: {nofo.viewCount}</span> */}
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6c757d', fontSize: '14px' }}>
            You haven’t viewed any NOFOs recently. Select or upload a document at the
            top of this page to get started.
          </p>
        )}
      </SpaceBetween>
    </div>
  );

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
          }}
        >
          <img
            src="/images/stateseal-color.png"
            alt="State Seal"
            style={{
              width: '65px',
              height: '65px',
              marginRight: '18px',
            }}
          />
          <h1 style={{ fontSize: '60px' }}>GrantWell</h1>
        </div>
      </div>

      <p
        style={{
          fontSize: '20px',
          marginBottom: '10px',
          marginTop: '10px',
          columnCount: 1,
          columnGap: '10px',
          textAlign: 'center'
        }}
      >
        GrantWell uses generative AI to help Massachusetts communities secure federal grants.       
      </p>

      <p
        style={{
          fontSize: '20px',
          marginBottom: '55px',
          marginTop: '10px',
          columnCount: 1,
          columnGap: '10px',
          textAlign: 'center'
        }}
      >
        There are three main pages to navigate: 
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid #000' }} />

      {/* Numbered Steps */}
      <div style={numberedStepsContainerStyle}>
        {/* Step 1 */}
        <div style={stepContainerStyle}>
          <div style={numberBubbleStyle}>1</div>
          <div style={stepContentStyle}>
            <h2 style={stepContentH2Style}>Landing (you are here!) </h2>
            <ul style={stepContentUlStyle}>
              <li style={stepContentLiStyle}>
                <strong>Select NOFO</strong> in the section below.
              </li>
              <li style={stepContentLiStyle}>
                <strong>Access</strong> recently viewed NOFOs for quick navigation.
              </li>
              <li style={stepContentLiStyle}>
                <strong>Find</strong> helpful resources and a feedback form.
              </li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div style={stepContainerStyle}>
          <div style={numberBubbleStyle}>2</div>
          <div style={stepContentStyle}>
            <h2 style={stepContentH2Style}>Requirements </h2>
            <ul style={stepContentUlStyle}>
              <li style={stepContentLiStyle}>
                <strong>View Key Info:</strong> eligibility criteria, required documents, narrative components, and key deadlines.
              </li>
              <li style={stepContentLiStyle}>
                <strong>Ready to begin your application?</strong> Click "Start a Proposal" in the side menu.
              </li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div style={stepContainerStyle}>
          <div style={numberBubbleStyle}>3</div>
          <div style={stepContentStyle}>
            <h2 style={stepContentH2Style}>Narrative Drafting </h2>
            <ul style={stepContentUlStyle}>
              <li style={stepContentLiStyle}>
                <strong>Draft</strong> your narrative with our AI chatbot, section by section.
              </li>
              {/* <li style={stepContentLiStyle}>
                <strong>Check out</strong> the Prompt Engineering Guide under "Resources."
              </li>
              <li style={stepContentLiStyle}>
                <strong>Managing multiple applications?</strong> Switch between them in "Session History."
              </li>
              <li style={stepContentLiStyle}>
                <strong>Need a different grant?</strong> Return to the Base Page and select a new NOFO.
              </li> */}
            </ul>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #000', marginBottom: '40px' }} />

      {/* Main Content */}
      <SpaceBetween size="xl">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', // CHANGE THIS FOR COLUMNS
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* "Select a NOFO" Tile */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#f0f4f8',
              border: '1px solid #d1e3f0',
              //display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h2
              style={{
                fontSize: '35px',
                marginBottom: '25px',
                lineHeight: '1',
                textAlign: 'center',
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
              {/* <li>Select a NOFO from the dropdown</li>
              <li>
                Click 'View Key Requirements' to review primary information from the
                NOFO
              </li> */}
            </ol>

            {isAdmin && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  marginLeft: '00px',
                }}
              >
                {/* <p
                  style={{
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: '#555',
                    margin: 0,
                    textAlign: 'left',
                    width: '400px',
                    marginRight: '25px',
                  }}
                >
                  ADMIN: Click "Upload New NOFO" to upload a document
                  <br />
                  to the dropdown that you can then select and review
                </p> */}
                <Button
                  onClick={uploadNOFO}
                  variant="primary"
                  aria-label="Upload New NOFO"
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
                minWidth: '300px',
                marginBottom: '20px',
              }}
            >
              <div style={{ width: '100%' }}>
                <Select
                  selectedOption={selectedDocument}
                  onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
                  options={documents}
                  placeholder="Select a document"
                  filteringType="auto"
                  aria-label="Select a NOFO document"
                />
              </div>
              <div style={{ marginLeft: '10px' }}>
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

        {/* "Additional Resources" Tile */}
        <div
          style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f0f4f8',
            border: '1px solid #d1e3f0',
            marginBottom: '40px',
          }}
        >
          <h2 style={{ fontSize: '24px' }}>Additional Resources</h2>
          <Cards
            cardDefinition={{
              header: (item) => (
                <Link href={item.href} external={item.external} fontSize="heading-m">
                  {item.name}
                </Link>
              ),
              sections: [
                {
                  content: (item) => (
                    <div 
                    style={{ 
                      minHeight: '200px',
                      padding: "10px"
                       }}>
                      <img
                        src={item.img}
                        alt={item.altText}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  ),
                },
                {
                  content: (item) => <div>{item.description}</div>,
                },
              ],
            }}
            cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 3 }]}
            items={[
              {
                name: 'Federal Grant Finder',
                external: true,
                href: 'https://www.usdigitalresponse.org/grant/grant-finder',
                img: '/images/Welcome/usdr.png',
                altText:
                  'Animated illustration of four characters celebrating federal grant funding, holding a check, coins, and a magnifying glass',
                description:
                  'Optimize access to grants with the Federal Grant Finder.',
              },
              {
                name: 'Register for Monthly Funding Meetings',
                external: true,
                href:
                  'https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl',
                img: '/images/Welcome/massFlag.png',
                altText: 'The Massachusetts state flag waving in the wind',
                description:
                  'Stay updated on funding opportunities by joining our monthly Federal Funds Partnership sessions.',
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
                  'Access categorized grant resources on mass.gov.',
              },
            ]}
          />
        </div>

        {/* "We Value Your Feedback!" Tile */}
        <div
          style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f0f4f8',
            border: '1px solid #d1e3f0',
            marginBottom: '40px',
          }}
        >
          <h2 style={{ fontSize: '24px' }}>We Value Your Feedback!</h2>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Your insights are essential to helping us improve the GrantWell tool. If you
            have any general feedback, suggestions on current features, or ideas for new
            functionalities, please take a moment to fill out our{' '}
            <Link href="https://forms.gle/M2PHgWTVVRrRubpc7" external>
              Google Form
            </Link>{' '}
            to share your thoughts.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            We’re committed to making GrantWell as effective and user-friendly as
            possible, and we’ll do our best to incorporate your feedback into future
            updates.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Thank you for helping us make GrantWell better for everyone!
          </p>
        </div>
      </SpaceBetween>

      {/* Affiliations Section */}
      <div
        style={{
          backgroundColor: '#161d26',
          color: '#fff',
          padding: '60px 20px',
          marginTop: '40px',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
        }}
      >
        <h2
          style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px' }}
        >
          Our Affiliations
        </h2>
        <p
          style={{
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 40px',
          }}
        >
          GrantWell is proudly owned by the Burnes Center for Social Change. This
          message can be changed as needed.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >
          <img
            src="/images/burnes_logo.png"
            alt="Burnes Center Logo"
            style={{ width: '250px', height: 'auto' }}
          />
          <img
            src="/images/northeastern.png"
            alt="Northeastern University Logo"
            style={{ width: '250px', height: 'auto' }}
          />
          {/* Add more logos as needed */}
        </div>
      </div>
    </Container>
  );
}