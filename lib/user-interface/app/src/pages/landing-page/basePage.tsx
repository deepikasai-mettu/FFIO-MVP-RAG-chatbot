import { useContext, useState, useEffect } from 'react';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from "../../common/app-context";
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

export default function Welcome({ theme }) {
  console.log("entering base page");

  const [loading, setLoading] = useState(true);
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recentlyViewedNOFOs, setRecentlyViewedNOFOs] = useState([]);
  const navigate = useNavigate();

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
      console.error("Error retrieving NOFOs: ", error);
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
        viewCount: (recentlyViewedNOFOs.find(nofo => nofo.value === selectedNOFO.value)?.viewCount || 0) + 1,
      },
      ...recentlyViewedNOFOs.filter(nofo => nofo.value !== selectedNOFO.value)
    ].slice(0, 3);

    setRecentlyViewedNOFOs(updatedHistory);
    localStorage.setItem('recentlyViewedNOFOs', JSON.stringify(updatedHistory));
    navigate(href);
  };

  const uploadNOFO = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        const documentName = file.name.split(".").slice(0, -1).join("");
        let newFilePath;
        if (file.type === 'text/plain'){
          newFilePath = `${documentName}/NOFO-File-TXT`;
        } else if (file.type === 'application/pdf'){
          newFilePath = `${documentName}/NOFO-File-PDF`;
        } else {
          newFilePath = `${documentName}/NOFO-File`;
        }

        const signedUrl = await apiClient.landingPage.getUploadURL(newFilePath, file.type);
        await apiClient.landingPage.uploadFileToS3(signedUrl, file);

        alert("File uploaded successfully!");
        await getNOFOListFromS3();
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload the file.");
      }
    };

    fileInput.click();
  };

  const goToChecklists = () => {
    if (selectedDocument) {
      const summaryFileKey = `${selectedDocument.value}`;
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(summaryFileKey)}`);
    }
  };

  const HistoryPanel = () => (
    <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0' }}>
      <h2 style={{ fontSize: '24px' }}>Recently Viewed NOFOs</h2>
      <SpaceBetween size="s">
        {recentlyViewedNOFOs.length > 0 ? (
          recentlyViewedNOFOs.map((nofo, index) => (
            <div key={index} style={{ padding: '10px', borderBottom: '1px solid #e1e4e8' }}>
              <Link
                onFollow={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(nofo.value)}`, nofo)}
              >
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{nofo.label}</span>
              </Link>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                <span>Last viewed: {nofo.lastViewed}</span><br />
                <span>View count: {nofo.viewCount}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6c757d', fontSize: '14px' }}>
            You haven’t viewed any NOFOs recently. Select or upload a document at the top of this page to get started.
          </p>
        )}
      </SpaceBetween>
    </div>
  );

  return (
    <Container>
      {/* <h1 style={{ fontSize: '60px', marginBottom: '50px' }}>
        GrantWell
      </h1> */}

      {/* Header with logo and title */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <img src="/images/stateseal-color.png" alt="State Seal" style={{ width: '55px', height: '55px', marginRight: '15px' }} />
        <h1 style={{ fontSize: '55px' }}>GrantWell</h1>
      </div>

      <p style={{
        fontSize: '17px',
        marginBottom: '20px',
        marginTop: '10px',
        columnCount: 1, // adjust number of columns
        columnGap: '10px' // Adjust space between columns
      }}>
        The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>

      <p style={{
        fontSize: '17px',
        marginBottom: '20px',
        marginTop: '10px',
        columnCount: 1, // adjust number of columns
        columnGap: '10px' // Adjust space between columns
      }}>
        GrantWell leverages generative AI to quickly summarize funding requirements from NOFOs and draft tailored project narratives, helping you create competitive, impactful proposals with ease.
      </p>

      <SpaceBetween size="xl">
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
          <div style={{ flex: 1, padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Select a NOFO (Notice of Funding Opportunity) Document</h2>

            <ol style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
              <li>Select a NOFO from the dropdown</li>
              <li>Click 'View Key Requirements' to review primary information from the NOFO</li>
              <li>Click "Upload New NOFO" to add a document to the dropdown that you can then select and review</li>
            </ol>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: '300px', marginBottom: '20px' }}>
              <div style={{ width: '70%' }}>
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
              <SpaceBetween size="xs">
                <Button onClick={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`, selectedDocument)} disabled={!selectedDocument} variant="primary" aria-label="View Key Requirements">
                  View Key Requirements
                </Button>
                <Button onClick={uploadNOFO} variant="primary" aria-label="Upload New NOFO">
                  Upload New NOFO
                </Button>
                </SpaceBetween>
              </div>
            </div>
          </div>

          <HistoryPanel />
        </div>

        <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '40px' }}>
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
                    <div style={{ minHeight: '200px' }}>
                      <img
                        src={item.img}
                        alt={item.altText}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '20px',
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
                name: "Register for Federal Funds Partnership Meetings",
                external: true,
                href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
                img: "/images/Welcome/massFlag.png",
                altText: "the Massachusetts state flag waving in the wind",
                description: "Stay updated on funding opportunities by joining our monthly sessions.",
              },
              {
                name: "Federal Grant Application Resources",
                external: true,
                href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
                img: "/images/Welcome/resources.png",
                altText: "Skyline of downtown Boston at sunset, featuring historic and modern buildings",
                description: "Access categorized grant resources for streamlined applications.",
              },
              {
                name: "Prompt Suggestions for Effective Chatbot Use",
                external: false,
                href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
                img: "/images/Welcome/promptSuggestions.png",
                altText: "Illustration of a person interacting with a chatbot on a smartphone, with the chatbot displayed on a large screen and speech bubbles representing the conversation.",
                description: "Learn how to interact with our chatbot for application guidance.",
              },
            ]}
          />
        </div>

        <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px' }}>We Value Your Feedback!</h2>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Your insights are essential to helping us improve the GrantWell tool. If you have any general feedback, suggestions on current features, or ideas for new functionalities, please take a moment to fill out our <Link href="https://forms.gle/jNHk8usCSNBzhL998" external>Google Form</Link> to share your thoughts.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            We’re committed to making GrantWell as effective and user-friendly as possible, and we’ll do our best to incorporate your feedback into future updates.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Thank you for helping us make GrantWell better for everyone!
          </p>
        </div>
        
      </SpaceBetween>
    </Container>
  );
}
