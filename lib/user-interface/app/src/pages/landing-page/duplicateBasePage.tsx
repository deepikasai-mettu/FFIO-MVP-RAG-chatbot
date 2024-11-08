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

  // Load recently viewed NOFOs from localStorage when the component mounts
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('recentlyViewedNOFOs')) || [];
    setRecentlyViewedNOFOs(storedHistory);
  }, []);

  // Function to retrieve NOFOs from S3 and store them in the 'documents' state
  const getNOFOListFromS3 = async () => {
    setLoading(true);
    try {
      const result = await apiClient.landingPage.getNOFOs();
      console.log("result: ", result);
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

  // Fetch NOFO documents from S3 on component mount
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

  // Handle NOFO selection, update the history with view count and timestamp, and navigate
  const handleNOFOSelect = (href, selectedNOFO) => {
    console.log("Navigating to:", href);

    const now = new Date().toLocaleString(); // Current timestamp

    // Update or add NOFO in recently viewed list with lastViewed and viewCount
    const updatedHistory = [
      {
        ...selectedDocument,
        lastViewed: now,
        viewCount: (recentlyViewedNOFOs.find(nofo => nofo.value === selectedNOFO.value)?.viewCount || 0) + 1,
      },
      ...recentlyViewedNOFOs.filter(nofo => nofo.value !== selectedNOFO.value),
    ].slice(0, 3);

    setRecentlyViewedNOFOs(updatedHistory);
    localStorage.setItem('recentlyViewedNOFOs', JSON.stringify(updatedHistory)); // Store history in localStorage

    navigate(href);
  };

  // Function for uploading a new NOFO
  const uploadNOFO = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0]; // Get the selected file

      if (!file) return;

      try {
        // Extract the document name without extension to use as the folder name
        const documentName = file.name.split(".").slice(0, -1).join("");
        //const newFilePath = `${documentName}/NOFO-File`;
        let newFilePath;
        if (file.type == 'text/plain'){
          newFilePath = `${documentName}/NOFO-File-TXT`;
        }else if (file.type == 'application/pdf'){
          newFilePath = `${documentName}/NOFO-File-PDF`;
        }else{
          newFilePath = `${documentName}/NOFO-File`;
        }

        // Get the signed URL for the new path (backend should support this structure)
        const signedUrl = await apiClient.landingPage.getUploadURL(newFilePath, file.type);

        // Upload the file to the specified path using the signed URL
        await apiClient.landingPage.uploadFileToS3(signedUrl, file);

        alert("File uploaded successfully!");

        // Refresh the list of documents to reflect the new upload
        await getNOFOListFromS3();
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload the file.");
      }
    };

    fileInput.click(); // Trigger the file selection dialog
  };

  // WHAT WAS MISSING: 
  const goToChecklists = () => {
    if (selectedDocument) {
      //working code for requirements gathering
      const summaryFileKey = `${selectedDocument.value}`;
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(summaryFileKey)}`);
      // console.log("DOC IDENTIFIER", documentIdentifier)
      // navigate(`/landing-page/basePage/checklists/${encodeURIComponent(documentIdentifier)}`, { state: { knowledgeBaseFolder: selectedDocument.value } });
      // //navigate(`/landing-page/basePage/checklists?folder=${encodeURIComponent(documentIdentifier)}`, { state: { knowledgeBaseFolder: documentIdentifier } });
    }
  };

  // Component for displaying the history panel with recently viewed NOFOs
  const HistoryPanel = () => (
    <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '40px' }}>
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
      <h1 style={{ fontSize: '60px', marginBottom: '50px' }}>
        GrantWell
      </h1>

      <p style={{ fontSize: '17px', marginBottom: '50px', marginTop: '10px' }}>
        The Federal Funds & Infrastructure Office (FFIO) is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>

      <SpaceBetween size="xl">
        {/* NOFO Selection Section with Grey Background */}
        <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            Select a NOFO (Notice of Funding Opportunity) Document
          </h2>

          {/* Step-by-step instructions for first-time users */}
          <ol style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
            <li>Select a NOFO from the dropdown</li>
            <li>Click 'View Key Requirements' to review primary information from the NOFO</li>
            <li>Click "Upload New NOFO" to add a document to the dropdown that you can then select and review</li>
          </ol>

          {/* Integrated search within the dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', width: '50%', minWidth: '300px', marginBottom: '20px' }}>
            <div style={{ width: '70%' }}>
              <Select
                selectedOption={selectedDocument}
                onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
                options={documents} // Full list of documents
                placeholder="Select a document"
                filteringType="auto" // Enables integrated search within dropdown
                aria-label="Select a NOFO document" // ARIA label for screen readers
              />
            </div>
            <div style={{ marginLeft: '10px' }}>
              <Button onClick={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`, selectedDocument)} disabled={!selectedDocument} variant="primary" aria-label="View Key Requirements">
                View Key Requirements
              </Button>
              <Button onClick={uploadNOFO} variant="primary" aria-label="Upload New NOFO">
                Upload New NOFO
              </Button>
            </div>
          </div>
        </div>

        {/* History Panel Section */}
        <HistoryPanel />

        {/* Additional Resources Section with Grey Background */}
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
                        alt={item.altText} // Use alt text from item object
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

        {/* Feedback Section */}
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
