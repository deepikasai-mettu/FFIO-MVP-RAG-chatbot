import { useContext, useState, useEffect } from 'react';
import { ApiClient } from "../../common/api-client/api-client";
import { AppContext } from "../../common/app-context";
import HistoryCarousel from './history-carousel';
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
import CarouselNext from "../../components/carousel";

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
  
      // Map documents with folder paths correctly
      setDocuments(
        result.CommonPrefixes.map((document) => ({
          label: document.Prefix.replace(/\/$/, ''),
          value: document.Prefix,
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
  // Function to handle NOFO selection and navigate to requirements page
  const handleNOFOSelect = (href: string) => {
    console.log("Navigating to:", href); // Log the navigation path
    navigate(href);
  };

  // NOFO upload attempt from base
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
        
        // Modify the filename to place it inside a new folder
        //const newFilePath = `${documentName}/${file.name}`;
        const newFilePath = `${documentName}/NOFO-File`;
  
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


  const goToChecklists = () => {
    if (selectedDocument) {
      const summaryFileKey = `${selectedDocument.value}summary-${selectedDocument.label}.json`;
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(summaryFileKey)}`);
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

      {/* Carousel Section */}
      {/* <div style={{ marginBottom: '40px' }}>
      <CarouselNext theme={theme} documents={documents} />
      </div> */}
      

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
        {/* History Carousel Section with New Heading */}
        <div>
          <h2>Recently Viewed NOFOs</h2>
          <HistoryCarousel onNOFOSelect={handleNOFOSelect} />
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
              name: "Register for Upcoming Federal Funds Partnership Meetings",
              external: true,
              href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
              img: "/images/Welcome/massFlag.png",
              description:
                "FFIO leads the monthly Massachusetts Federal Funds Partnership meeting, which provides critical funding updates and addresses questions.",
            },
            {
              name: "Federal Grant Application Resources",
              external: true,
              href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
              img: "/images/Welcome/resourcesImage.png",
              description: "Grant application resources sorted by policy area.",
            },
            {
              name: "Prompt Suggestions for Effective Chatbot Use",
              external: false,
              href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
              img: "/images/Welcome/promptSuggestions.png",
              description:
                "Resource document with prompts to help users effectively interact with an AI chatbot designed to assist in understanding grant NOFOs, drafting narrative sections, refining drafts, addressing tone, anticipating reviewer feedback, and clarifying eligibility criteria.",
            }
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