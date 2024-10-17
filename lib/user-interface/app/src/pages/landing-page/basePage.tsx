import { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import {
  SpaceBetween,
  Cards,
  Select,
  Container,
  Button,
  Link,
} from '@cloudscape-design/components';

import { useNavigate } from 'react-router-dom';

export default Welcome;
function Welcome({ theme }) {
  console.log('entering base page');

  const [documents, setDocuments] = useState([
    { label: 'Doc 1', value: 'doc1-url' },
    { label: 'Doc 2', value: 'doc2-url' },
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  const goToChecklists = () => {
    if (selectedDocument) {
      navigate(
        `/landing-page/basePage/checklists/${encodeURIComponent(
          selectedDocument.value
        )}`
      );
    }
  };

  return (
    <Container>
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
              name: "Prompt Engineering Guide",
              type: " ",
              external: true,
              href: "https://www.promptingguide.ai/",
              img: "/images/Welcome/PromptEngineeringGuide.png",
              description:
                "Learn how to craft clear and specific questions to get the best answers from an AI system.",
            },
            {
              name: "Federal Funds Grant Application Resources",
              type: " ",
              external: true,
              href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
              img: "/images/Welcome/resourcesImage.png",
              description:
                "Grant application resources sorted by policy area.",
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
