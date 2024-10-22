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

  const goToChecklists = () => {
    if (selectedDocument) {
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`);
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
              name: "Prompt Engineering Guide",
              type: " ",
              external: true,
              href: "https://www.promptingguide.ai/",
              img: "/images/Welcome/PromptEngineeringGuide.png",
              description:
              "Prompt engineering is the skill of crafting clear and specific questions to get the best answers from an AI system.",
          },
          ]}
        />
      </SpaceBetween>
    </Container>
  );
}

// import {
//     ContentLayout,
//     Header,
//     Container,
//     Cards,
//     SpaceBetween,
//     Link,
//     BreadcrumbGroup,
//     Box,
//     Button,
//     CollectionPreferences,
//     Pagination,
//     TextFilter,
// } from "@cloudscape-design/components";
// import BaseAppLayout from "../../components/base-app-layout";
// import RouterButton from "../../components/wrappers/router-button";
// import useOnFollow from "../../common/hooks/use-on-follow";
// import {CHATBOT_NAME} from "../../common/constants";
// // import CarouselNext from "../../components/carousel";


// export default function Welcome({theme}) {
//     const onFollow = useOnFollow();

//     return (
//         <BaseAppLayout
//             breadcrumbs={
//                 <BreadcrumbGroup
//                     onFollow={onFollow}
//                     items={[
//                         {
//                             text: CHATBOT_NAME,
//                             href: "/",
//                         },
//                     ]}
//                 />
//             }
//             content={
//                 <ContentLayout
//                     header={
//                         <Header
//                             variant="h1"
//                             description="Choose a Grant you want to work on in the dropdown."
//                             actions= {[
//                                 <RouterButton
//                                      key='getting-started' variant="primary" href="/chatbot/playground"
//                                  >
//                                      Getting Started
//                                  </RouterButton>
//                             ]}
//                         >
//                             <span className="grantAssistantHome">Grant Assistant Home</span>
//                         </Header>
//                     }
//                 >
//                     <SpaceBetween size="l">
//                         <Cards 
//                             cardDefinition={{
                                
//                                 header: (item) => (
//                                     <Link
//                                         external={item.external}
//                                         href={item.href}
//                                         fontSize="heading-m"
//                                     >
//                                         {item.name}
//                                     </Link>
//                                 ),
//                                 sections: [
//                                     {
//                                         content: (item) => (
                                           
//                                             <div style={{minHeight: '200px'}}>
//                                                 <img
//                                                     //src={item.img}
//                                                     alt="Placeholder"
//                                                     style={{
//                                                         width: "100%",
//                                                         height: '180px',
//                                                         objectFit: 'cover',
//                                                         borderRadius: '20px'
//                                                     }}
//                                                 />
//                                             </div>
                                            
//                                         ),
//                                     },
//                                     {
//                                         content: (item) => (
                                            
//                                                 <div>{item.description}</div>
                                           
//                                         ),
//                                     },
//                                     {
//                                         id: "type",
//                                         header: " ",
//                                         content: (item) => item.type,
//                                     },
//                                 ],
//                             }}
//                             cardsPerRow={[{cards: 1}, {minWidth: 992, cards: 2}]}
//                             // <CarouselNext theme={theme}></CarouselNext>
//                             items={[
//                                 {
//                                     name: "Chatbot",
//                                     external: false,
//                                     type: " ",
//                                     href: "/chatbot/playground",
//                                     //img: "/images/welcome/chatbotWhite.jpg",
//                                     description:
//                                         "Write multiple grants to different munis",
//                                 },
//                                 //{
//                                 //    name: "Multi-Chat Playground",
//                                 //    external: false,
//                                 //    type: " ",
//                                 //    href: "/chatbot/multichat",
//                                 //    img: "/images/welcome/multichat.png",
//                                 //    description:
//                                 //        "Compare how models respond to the same prompt",
//                                 //},
                             
//                             ]}
                         

//                         />



//                         <Header
//                             variant="h1"
//                             description="Automate daily tasks with AI driven solutions. Optimize how you summarize, draft, and extract information."
//                         >
//                             Tasks
//                         </Header>

//                          <div className="task-container">
                          
//                         </div>                        
//                         <Header
//                             variant="h2"
//                             description="Explore our comprehensive library of learning materials designed to enhance your skills in generative AI, prompt engineering, and other cutting-edge AI technologies. Dive into tutorials, guides, and interactive courses tailored for all levels, from beginners to advanced practitioners."
//                         >
//                             Learn More
//                        </Header>
//                             <Cards
//                                 cardDefinition={{
//                                     header: (item) => (
//                                         <Link
//                                             href={item.href}
//                                             external={item.external}
//                                             fontSize="heading-m"
//                                         >
//                                             {item.name}
//                                         </Link>
//                                     ),
//                                     sections: [
//                                         {
//                                             content: (item) => (
//                                                 <div style={{minHeight: '200px'}}>
//                                                     <img
//                                                         src={item.img}
//                                                         alt="Placeholder"
//                                                         style={{
//                                                             width: "100%",
//                                                             height: '180px',
//                                                             objectFit: 'cover',
//                                                             borderRadius: '20px'
//                                                         }}
//                                                     />
//                                                 </div>
//                                             ),
//                                         },
//                                         {
//                                             content: (item) => (
//                                                 <div>
//                                                     <div>{item.description}</div>
//                                                 </div>
//                                             ),
//                                         },
//                                         {
//                                             id: "type",
//                                             header: " ",
//                                             content: (item) => item.type,
//                                         },
//                                     ],
//                                 }}
//                                 cardsPerRow={[{cards: 1}, {minWidth: 700, cards: 3}]}
//                                 items={[
//                                     {
//                                         name: "Learn What Generative AI Can Do",
//                                         type: " ",
//                                         external: true,
//                                         href: "https://youtu.be/jNNatjruXx8?si=dRhLLnnBxiNByon4",
//                                         img: "/images/Welcome/GenAICapabilities.png",
//                                         description:
//                                             "Discover the capabilities of generative AI and learn how to craft effective prompts to enhance productivity.",
//                                         tags: [""],
//                                     },
//                                     {
//                                         name: "Advanced Data Analytics",
//                                         type: " ",
//                                         external: true,
//                                         href: "https://aws.amazon.com/blogs/big-data/amazon-opensearch-services-vector-database-capabilities-explained/",
//                                         img: "/images/Welcome/AdvancedDataAnalytics.png",
//                                         description:
//                                             "Transform data into actionable insights, driving strategic decisions for your organization.",
//                                     },
//                                     {
//                                         name: "Prompt Engineering Guide",
//                                         external: true,
//                                         type: " ",
//                                         href: "https://www.promptingguide.ai/",
//                                         img: "images/Welcome/PromptEngineeringGuide.png",
//                                         description:
//                                             "Prompt engineering is the skill of crafting clear and specific questions to get the best answers from an AI system.",
//                                     },
//                                 ]}
//                             />
//                     </SpaceBetween>
//                 </ContentLayout>
//             }
//         />
//     );
// }