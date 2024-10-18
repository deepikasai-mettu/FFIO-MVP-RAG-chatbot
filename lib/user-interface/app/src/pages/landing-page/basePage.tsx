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
  Button,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

export default function Welcome({ theme }) {
  console.log("entering base page")
  const [loading, setLoading] = useState(true);
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  const getNOFOListFromS3 = async () => {
      setLoading(true);
      try {
        // Call the API to fetch NOFOs
        const result = await apiClient.landingPage.getNOFOs();
        console.log("result: ", result);
        // Set the documents to the state
        setDocuments(result.Contents.map((doc) => ({ label: doc.Key, value: doc.Key })));
      } catch (error) {
        console.log("print error: ", error);
        console.log("Error with retriveing NOFOs");
      }
      setLoading(false);
    };

  // Fetch NOFO list from S3
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

  const goToChecklists = () => {
    if (selectedDocument) {
      navigate(
        `/landing-page/basePage/checklists/${encodeURIComponent(
          selectedDocument.value
        )}`
      );
    }
  };
  // Handle file upload
  // const handleUpload = async () => {
  //   if (!file) {
  //     alert('Please select a file to upload.');
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   try {
  //     await axios.post('/api/upload_nofo', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     alert('File uploaded successfully');
  //     setFile(null); // Clear the file input after successful upload
  //   } catch (error) {
  //     console.error('Error uploading file', error);
  //   }
  // };

  return (
    <Container>
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
        GrantWell
      </h1>

      <p style={{ fontSize: '17px', marginBottom: '20px' }}>
        The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
        GrantWell
      </h1>

      <p style={{ fontSize: '17px', marginBottom: '20px' }}>
        The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>

      <SpaceBetween size="l">
        <div>
          <h2>
            Select a NOFO Document
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '50%',
              minWidth: '300px',
              marginBottom: '20px',
            }}
          >
            <div style={{ width: '70%' }}>
              <Select
                selectedOption={selectedDocument}
                onChange={({ detail }) =>
                  setSelectedDocument(detail.selectedOption)
                }
                options={documents}
                placeholder="Select a document"
              />
            </div>
            <div style={{ marginLeft: '10px' }}>
              <Button
                onClick={goToChecklists}
                disabled={!selectedDocument}
                variant="primary"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <h2>
          Additional Resources
        </h2>
          <h2>
            Select a NOFO Document
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '50%',
              minWidth: '300px',
              marginBottom: '20px',
            }}
          >
            <div style={{ width: '70%' }}>
              <Select
                selectedOption={selectedDocument}
                onChange={({ detail }) =>
                  setSelectedDocument(detail.selectedOption)
                }
                options={documents}
                placeholder="Select a document"
              />
            </div>
            <div style={{ marginLeft: '10px' }}>
              <Button
                onClick={goToChecklists}
                disabled={!selectedDocument}
                variant="primary"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <h2>
          Additional Resources
        </h2>

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
                type: " ",
                external: true,
                href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
                img: "/images/Welcome/massFlag.png",
                description:
                "FFIO leads the monthly Massachusetts Federal Funds Partnership meeting. This forum not only delivers critical updates but also offers a platform for addressing questions related to the many funding possibilities at the disposal of cities, towns and tribal organizations.",
                tags: [""],
            },
            {
                name: "Federal Funds Grant Application Resources",
                type: " ",
                external: true,
                href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
                img: "/images/Welcome/resourcesImage.png",
                description:
                "See for grant application resources sorted by policy area",
            },
            {
              name: "Registration Link for Upcoming Massachusetts Federal Funds Partnership (MFFP) Meetings",
              type: " ",
              external: true,
              href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
              img: "/images/Welcome/massFlag.png",
              description:
                "These FFIO-led meetings not only delivers critical updates but also offers a platform for addressing questions related to the many funding possibilities at the disposal of cities, towns and tribal organizations.",
            },
          ]}
        />
      </SpaceBetween>
    </Container>
  );
}
