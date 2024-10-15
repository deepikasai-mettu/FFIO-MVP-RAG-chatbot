import { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import {
  Header,
  SpaceBetween,
  Cards,
  Select,
  Container,
  Link,
} from '@cloudscape-design/components';

import { useNavigate } from 'react-router-dom';

async function getNOFOListFromS3() {
  console.log("calling retrive function")
  try {
    const s3Client = new S3Client();
    const bucketName = "ffio-nofos-bucket";
    const response = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const nofoList = response.Contents?.filter(item => item.Key?.endsWith('.pdf') || item.Key?.endsWith('.docx')).map(item => ({
      name: item.Key,
      url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`
    }));
    console.log("found nofos");
      
    return nofoList || [];
  } catch (error) {
    console.error('Error fetching NOFO list:', error);
    return [];
  }
}
export default Welcome;
function Welcome({ theme }) {
  console.log("entering base page")
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  // Fetch NOFO list from S3
  useEffect(() => {
    console.log('entering fetching 1 in base page')
    const fetchDocuments = async () => {
      console.log('entering fetching 2 in base page')
        const nofos = await getNOFOListFromS3();
        console.log('nofos:', nofos)
        setDocuments(nofos.map((doc) => ({ label: doc.name, value: doc.url })));
        console.log('documents: ', documents)
    };
    fetchDocuments();
  }, []);
  const goToChecklists = () => {
    navigate(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`);
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
      <Header variant="h1" description="Manage your NOFO documents and learning resources.">
        Grant Assistant Home
      </Header>

      <SpaceBetween size="l">
        <div>
          <h1> Select a NOFO Document</h1>
          <Select
            selectedOption={selectedDocument}
            onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
            options={documents}
            placeholder="Select a document"
          />
        </div>
{/*}
        <Box>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button onClick={handleUpload} variant="primary">
            Upload Document
          </Button>
        </Box>
/*}
        {/* Learning Resources Section */}
        <Header
          variant="h2"
          description="The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities."
        >
          Resources for local leaders to maximize federal funding for Massachusetts communities.
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