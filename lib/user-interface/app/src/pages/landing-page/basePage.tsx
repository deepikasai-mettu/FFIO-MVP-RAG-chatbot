import React, { useState, useEffect } from 'react';
import {
  Header,
  SpaceBetween,
  Cards,
  Select,
  Button,
  Box,
  Container,
  Link,
} from '@cloudscape-design/components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default Welcome;

function Welcome({ theme }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // Function to navigate to the Checklists page
  const goToChecklists = () => {
      navigate(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`);
  };

  // Fetch NOFO list from the Flask backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/get_nofo_list');
        setDocuments(response.data.map((doc) => ({ label: doc.name, value: doc.url })));
      } catch (error) {
        console.error('Error fetching documents', error);
      }
    };
    fetchDocuments();
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/upload_nofo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully');
      setFile(null); // Clear the file input after successful upload
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };


  return (
    <Container>
      <Header variant="h1" description="Manage your NOFO documents and learning resources.">
        Grant Assistant Home
      </Header>

      <SpaceBetween size="l">
        {/* Dropdown for selecting documents */}
        <Box>
          <Select
            selectedOption={selectedDocument}
            onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
            options={documents}
            placeholder="Select a document"
          />
        </Box>

        {/* Upload button */}
        <Box>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button onClick={handleUpload} variant="primary">
            Upload Document
          </Button>
        </Box>

        {/* Button to navigate to Checklists */}
        <Box>
          <Button onClick={goToChecklists} variant="primary">
            To Checklists
          </Button>
        </Box>

        {/* Learning Resources Section */}
        <Header
          variant="h2"
          description="Explore our comprehensive library of learning materials."
        >
          Learn More
        </Header>

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
                name: "Learn What Generative AI Can Do",
                type: " ",
                external: true,
                href: "https://youtu.be/jNNatjruXx8?si=dRhLLnnBxiNByon4",
                img: "/images/Welcome/GenAICapabilities.png",
                description:
                "Discover the capabilities of generative AI and learn how to craft effective prompts to enhance productivity.",
                tags: [""],
            },
            {
                name: "Advanced Data Analytics",
                type: " ",
                external: true,
                href: "https://aws.amazon.com/blogs/big-data/amazon-opensearch-services-vector-database-capabilities-explained/",
                img: "/images/Welcome/AdvancedDataAnalytics.png",
                description:
                "Transform data into actionable insights, driving strategic decisions for your organization.",
            },
            {
                name: "Prompt Engineering Guide",
                external: true,
                type: " ",
                href: "https://www.promptingguide.ai/",
                img: "images/Welcome/PromptEngineeringGuide.png",
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