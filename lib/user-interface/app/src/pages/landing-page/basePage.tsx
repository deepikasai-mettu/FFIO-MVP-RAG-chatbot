import { useContext, useState, useEffect } from 'react';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from "../../common/app-context";
import {
  SpaceBetween,
  Cards,
  Select,
  Container,
  Button,
  Link,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

export default function Welcome({ theme }) {
  console.log("entering base page");
  const [loading, setLoading] = useState(true);
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  const getNOFOListFromS3 = async () => {
    setLoading(true);
    try {
      const result = await apiClient.landingPage.getNOFOs();
      console.log("result: ", result);
      setDocuments(result.Contents.map((doc) => ({ label: doc.Key, value: doc.Key })));
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

  // upload a NOFO to the NOFO s3
  const uploadNOFO = async () => {
    if (!selectedDocument) {
      alert('Please select a file to upload.');
      return;
    }
  
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
  
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
  
      try {
        const signedUrl = await apiClient.landingPage.getUploadURL(file.name, file.type);
        await apiClient.landingPage.uploadFileToS3(signedUrl, file);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload the file.');
      }
    };
  
    fileInput.click();
  };

  const goToChecklists = () => {
    if (selectedDocument) {
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`);
    }
  };

  return (
    <Container>
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>GrantWell</h1>
      <p style={{ fontSize: '17px', marginBottom: '20px' }}>
        The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>

      <SpaceBetween size="l">
        <div>
          <h2>Select a NOFO Document</h2>
          <div style={{ display: 'flex', alignItems: 'center', width: '50%', minWidth: '300px', marginBottom: '20px' }}>
            <div style={{ width: '70%' }}>
              <Select
                selectedOption={selectedDocument}
                onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
                options={documents}
                placeholder="Select a document"
              />
            </div>
            <div style={{ marginLeft: '10px' }}>
              <Button onClick={goToChecklists} disabled={!selectedDocument} variant="primary">
                Submit
              </Button>
              <Button onClick={uploadNOFO} variant="primary">
                Upload
              </Button>
            </div>
          </div>
        </div>

        <h2>Additional Resources</h2>
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
                      alt="Placeholder"
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
              name: "Register here for upcoming meetings",
              external: true,
              href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
              img: "/images/Welcome/massFlag.png",
              description:
                "FFIO leads the monthly Massachusetts Federal Funds Partnership meeting, providing critical updates and addressing funding questions.",
            },
            {
              name: "Federal Funds Grant Application Resources",
              external: true,
              href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
              img: "/images/Welcome/resourcesImage.png",
              description: "Find grant application resources sorted by policy area.",
            },
            {
              name: "Upcoming MFFP Meetings Registration",
              external: true,
              href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
              img: "/images/Welcome/massFlag.png",
              description:
                "FFIO meetings offer updates and a platform for addressing questions about funding opportunities.",
            },
          ]}
        />
      </SpaceBetween>
    </Container>
  );
}
