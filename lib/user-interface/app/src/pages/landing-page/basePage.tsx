// putting the upload button back in: 

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
      ...recentlyViewedNOFOs.filter(nofo => nofo.value !== selectedNOFO.value)
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
  const HistoryPanel = () => (
    <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0' }}>
      <h2>Recently Viewed NOFOs</h2>
      <SpaceBetween size="s">
        {recentlyViewedNOFOs.map((nofo, index) => (
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
        ))}
      </SpaceBetween>
    </div>
  );

  return (
    <Container>
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
        GrantWell
      </h1>

      <p style={{ fontSize: '17px', marginBottom: '20px' }}>
        The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
      </p>

      <SpaceBetween size="l">
        {/* NOFO Selection Section */}
        <div>
          <h2>Select a NOFO Document</h2>
          <div style={{ display: 'flex', alignItems: 'center', width: '50%', minWidth: '300px', marginBottom: '20px' }}>
            <div style={{ width: '70%' }}>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <Select
                selectedOption={selectedDocument}
                onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
                options={documents}
                placeholder="Select document"
              />
              )}
              
            </div>
            <div style={{ marginLeft: '10px' }}>
              <Button onClick={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`, selectedDocument)} disabled={!selectedDocument} variant="primary">
                Submit
              </Button>
              <Button onClick={uploadNOFO} variant="primary">
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* History Panel Section */}
        <HistoryPanel />

        {/* Additional Resources Section */}
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




// CODE THAT DOES NOT (NOT NOT NOT NOT) INCLUDE LAST VIEWED AND VIEW COUNT FOR THE HISTORY PANEL
// doesn't have the upload button either






// import { useContext, useState, useEffect } from 'react';
// import { ApiClient } from "../../common/api-client/api-client";
// import { AppContext } from "../../common/app-context";
// import {
//   Header,
//   SpaceBetween,
//   Cards,
//   Select,
//   Container,
//   Link,
//   Button,
// } from '@cloudscape-design/components';
// import { useNavigate } from 'react-router-dom';
// export default function Welcome({ theme }) {
//   console.log("entering base page");
//   // State variables for loading, selected NOFO document, list of NOFO documents, and recently viewed NOFOs
//   const [loading, setLoading] = useState(true);
//   const appContext = useContext(AppContext);
//   const apiClient = new ApiClient(appContext);
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [recentlyViewedNOFOs, setRecentlyViewedNOFOs] = useState([]);
//   const navigate = useNavigate();
//   // Load recently viewed NOFOs from localStorage when the component mounts
//   useEffect(() => {
//     const storedHistory = JSON.parse(localStorage.getItem('recentlyViewedNOFOs')) || [];
//     setRecentlyViewedNOFOs(storedHistory);
//   }, []);
//   // Function to retrieve NOFOs from S3 and store them in the 'documents' state
//   const getNOFOListFromS3 = async () => {
//     setLoading(true); // Set loading state to true before fetching
//     try {
//       const result = await apiClient.landingPage.getNOFOs();
//       console.log("result: ", result);
//       // Map document paths and set them in the 'documents' state
//       setDocuments(
//         result.CommonPrefixes.map((document) => ({
//           label: document.Prefix.replace(/\/$/, ''), // Format document label
//           value: document.Prefix, // Unique path for each NOFO
//         }))
//       );
//     } catch (error) {
//       console.error("Error retrieving NOFOs: ", error);
//     }
//     setLoading(false); // Set loading state to false after fetching
//   };
//   // Fetch NOFO documents from S3 on component mount
//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         await getNOFOListFromS3();
//       } catch (error) {
//         console.error('Failed to fetch NOFO documents:', error);
//       }
//     };
//     fetchDocuments();
//   }, []);
//   // Handle NOFO selection, update the history, and navigate to the requirements page
//   const handleNOFOSelect = (href, selectedNOFO) => {
//     console.log("Navigating to:", href);
//     // Update the history with the selected NOFO and limit history to the last three entries
//     const updatedHistory = [selectedNOFO, ...recentlyViewedNOFOs.filter(nofo => nofo.value !== selectedNOFO.value)].slice(0, 3);
//     setRecentlyViewedNOFOs(updatedHistory);
//     localStorage.setItem('recentlyViewedNOFOs', JSON.stringify(updatedHistory)); // Store history in localStorage
//     navigate(href); // Navigate to the requirements page for the selected NOFO
//   };
//   // Component for displaying the history panel with recently viewed NOFOs
//   const HistoryPanel = () => (
//     <div>
//       <h2>Recently Viewed NOFOs</h2>
//       <SpaceBetween size="s">
//         {recentlyViewedNOFOs.map((nofo, index) => (
//           <Link
//             key={index}
//             onFollow={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(nofo.value)}`, nofo)}
//           >
//             {nofo.label}
//           </Link>
//         ))}
//       </SpaceBetween>
//     </div>
//   );
//   return (
//     <Container>
//       <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
//         GrantWell
//       </h1>
//       <p style={{ fontSize: '17px', marginBottom: '20px' }}>
//         The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
//       </p>
//       <SpaceBetween size="l">
//         {/* NOFO Selection Section */}
//         <div>
//           <h2>Select a NOFO Document</h2>
//           <div style={{ display: 'flex', alignItems: 'center', width: '50%', minWidth: '300px', marginBottom: '20px' }}>
//             <div style={{ width: '70%' }}>
//               <Select
//                 selectedOption={selectedDocument}
//                 onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
//                 options={documents}
//                 placeholder="Select a document"
//               />
//             </div>
//             <div style={{ marginLeft: '10px' }}>
//               <Button
//                 onClick={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(selectedDocument.value)}`, selectedDocument)}
//                 disabled={!selectedDocument}
//                 variant="primary"
//               >
//                 Submit
//               </Button>
//             </div>
//           </div>
//         </div>
//         {/* History Panel Section */}
//         <HistoryPanel />
//         {/* Additional Resources Section */}
//         <h2>Additional Resources</h2>
//         <Cards
//           cardDefinition={{
//             header: (item) => (
//               <Link href={item.href} external={item.external} fontSize="heading-m">
//                 {item.name}
//               </Link>
//             ),
//             sections: [
//               {
//                 content: (item) => (
//                   <div style={{ minHeight: '200px' }}>
//                     <img
//                       src={item.img}
//                       alt="Placeholder"
//                       style={{
//                         width: '100%',
//                         height: '180px',
//                         objectFit: 'cover',
//                         borderRadius: '20px',
//                       }}
//                     />
//                   </div>
//                 ),
//               },
//               {
//                 content: (item) => <div>{item.description}</div>,
//               },
//             ],
//           }}
//           cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 3 }]}
//           items={[
//             {
//               name: "Register for Upcoming Federal Funds Partnership Meetings",
//               external: true,
//               href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
//               img: "/images/Welcome/massFlag.png",
//               description:
//                 "FFIO leads the monthly Massachusetts Federal Funds Partnership meeting, which provides critical funding updates and addresses questions.",
//             },
//             {
//               name: "Federal Grant Application Resources",
//               external: true,
//               href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
//               img: "/images/Welcome/resourcesImage.png",
//               description: "Grant application resources sorted by policy area.",
//             },
//             {
//               name: "Prompt Suggestions for Effective Chatbot Use",
//               external: false,
//               href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
//               img: "/images/Welcome/promptSuggestions.png",
//               description:
//                 "Resource document with prompts to help users effectively interact with an AI chatbot designed to assist in understanding grant NOFOs, drafting narrative sections, refining drafts, addressing tone, anticipating reviewer feedback, and clarifying eligibility criteria.",
//             }
//           ]}
//         />
//       </SpaceBetween>
//     </Container>
//   );
// }






// DEEPIKA'S CODE THAT DOESN'T HAVE FULL FUNCTIONALITY FOR WHATEVER REASON: 






// import { useContext, useState, useEffect } from 'react';
// import { ApiClient } from "../../common/api-client/api-client";
// import { AppContext } from "../../common/app-context";
// //import HistoryCarousel from './history-carousel';
// import {
//   Header,
//   SpaceBetween,
//   Cards,
//   Select,
//   Container,
//   Link,
//   Button,
// } from '@cloudscape-design/components';
// import { useNavigate } from 'react-router-dom';
// //import CarouselNext from "../../components/carousel";

// export default function Welcome({ theme }) {
//   console.log("entering base page");
//   const [loading, setLoading] = useState(true);
//   const appContext = useContext(AppContext);
//   const apiClient = new ApiClient(appContext);
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [recentlyViewedNOFOs, setRecentlyViewedNOFOs] = useState([]);
//   console.log("Selected doc: ", selectedDocument)
//   const navigate = useNavigate();
//   const [documents, setDocuments] = useState([]);

//   useEffect(() => {
//     const storedHistory = JSON.parse(localStorage.getItem('recentlyViewedNOFOs')) || [];
//     setRecentlyViewedNOFOs(storedHistory);
//   }, []);

//   const getNOFOListFromS3 = async () => {
//     setLoading(true);
//     try {
//       const result = await apiClient.landingPage.getNOFOs();
//       console.log("result: ", result);
  
//       // Map documents with folder paths correctly
//       setDocuments(
//         result.CommonPrefixes.map((document) => ({
//           label: document.Prefix.replace(/\/$/, ''),
//           value: document.Prefix,
//         }))
//       );
//     } catch (error) {
//       console.error("Error retrieving NOFOs: ", error);
//     }
//     setLoading(false);
//   };  

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         await getNOFOListFromS3();
//       } catch (error) {
//         console.error('Failed to fetch NOFO documents:', error);
//       }
//     };
//     fetchDocuments();
//   }, []);
  
//   // Function to handle NOFO selection and navigate to requirements page
//   const handleNOFOSelect = (href, selectedNOFO) => {
//     console.log("Navigating to:", href);
//     // Update the history with the selected NOFO and limit history to the last three entries
//     const updatedHistory = [selectedNOFO, ...recentlyViewedNOFOs.filter(nofo => nofo.value !== selectedNOFO.value)].slice(0, 3);
//     setRecentlyViewedNOFOs(updatedHistory);
//     localStorage.setItem('recentlyViewedNOFOs', JSON.stringify(updatedHistory)); // Store history in localStorage
//     navigate(href); // Navigate to the requirements page for the selected NOFO
//   };

//   // NOFO upload attempt from base
//   const uploadNOFO = async () => {
//     const fileInput = document.createElement("input");
//     fileInput.type = "file";
  
//     fileInput.onchange = async (event) => {
//       const target = event.target as HTMLInputElement;
//       const file = target.files?.[0]; // Get the selected file
  
//       if (!file) return;
  
//       try {
//         // Extract the document name without extension to use as the folder name
//         const documentName = file.name.split(".").slice(0, -1).join("");
        
//         // Modify the filename to place it inside a new folder
//         //const newFilePath = `${documentName}/${file.name}`;
//         const newFilePath = `${documentName}/NOFO-File`;
  
//         // Get the signed URL for the new path (backend should support this structure)
//         const signedUrl = await apiClient.landingPage.getUploadURL(newFilePath, file.type);
  
//         // Upload the file to the specified path using the signed URL
//         await apiClient.landingPage.uploadFileToS3(signedUrl, file);
  
//         alert("File uploaded successfully!");
  
//         // Refresh the list of documents to reflect the new upload
//         await getNOFOListFromS3();
//       } catch (error) {
//         console.error("Upload failed:", error);
//         alert("Failed to upload the file.");
//       }
//     };
  
//     fileInput.click(); // Trigger the file selection dialog
//   };  


//   const goToChecklists = () => {
//     if (selectedDocument) {
//       //working code for requirements gathering
//       const summaryFileKey = `${selectedDocument.value}summary-${selectedDocument.label}.json`;
//       navigate(`/landing-page/basePage/checklists/${encodeURIComponent(summaryFileKey)}`);
//       // const documentIdentifier = selectedDocument.value.replace(/\/$/, ''); // Remove trailing slash
//       // console.log("DOC IDENTIFIER", documentIdentifier)

//       // //const summaryFileKey = `${selectedDocument.value}summary-${selectedDocument.label}.json`;
//       // navigate(`/landing-page/basePage/checklists/${encodeURIComponent(documentIdentifier)}`, { state: { knowledgeBaseFolder: selectedDocument.value } });
//       // //navigate(`/landing-page/basePage/checklists?folder=${encodeURIComponent(documentIdentifier)}`, { state: { knowledgeBaseFolder: documentIdentifier } });
//     }
//   };
//   const HistoryPanel = () => (
//     <div>
//       <h2>Recently Viewed NOFOs</h2>
//       <SpaceBetween size="s">
//         {recentlyViewedNOFOs.map((nofo, index) => (
//            <Link
//            key={index}
//            onFollow={() => handleNOFOSelect(`/landing-page/basePage/checklists/${encodeURIComponent(nofo.value)}`, nofo)}
//          >
//            {nofo.label}
//          </Link>
//         ))}
//       </SpaceBetween>
//     </div>
//   );

//   return (
//     <Container>
//       <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
//         GrantWell
//       </h1>

//       <p style={{ fontSize: '17px', marginBottom: '20px' }}>
//         The Federal Funds & Infrastructure Office is dedicated to empowering Massachusetts local governments in their pursuit of federal funding opportunities for the betterment of their communities.
//       </p>

//       {/* Carousel Section */}
//       {/* <div style={{ marginBottom: '40px' }}>
//       <CarouselNext theme={theme} documents={documents} />
//       </div> */}
      

//       <SpaceBetween size="l">
//         <div>
//           <h2>Select a NOFO Document</h2>
//           <div style={{ display: 'flex', alignItems: 'center', width: '50%', minWidth: '300px', marginBottom: '20px' }}>
//             <div style={{ width: '70%' }}>
//               <Select
//                 selectedOption={selectedDocument}
//                 onChange={({ detail }) => setSelectedDocument(detail.selectedOption)}
//                 options={documents}
//                 placeholder="Select a document"
//               />
//             </div>
//             <div style={{ marginLeft: '10px' }}>
//               <Button onClick={goToChecklists} disabled={!selectedDocument} variant="primary">
//                 Submit
//               </Button>
//               <Button onClick={uploadNOFO} variant="primary">
//                 Upload
//               </Button>
//             </div>
//           </div>
//         </div>
//         {/* History Section with New Heading */}
//         <HistoryPanel />

//         {/* Additional Resources Section */}
//         <h2>
//           Additional Resources
//         </h2>

//         <Cards
//           cardDefinition={{
//             header: (item) => (
//               <Link href={item.href} external={item.external} fontSize="heading-m">
//                 {item.name}
//               </Link>
//             ),
//             sections: [
//               {
//                 content: (item) => (
//                   <div style={{ minHeight: '200px' }}>
//                     <img
//                       src={item.img}
//                       alt="Placeholder"
//                       style={{
//                         width: '100%',
//                         height: '180px',
//                         objectFit: 'cover',
//                         borderRadius: '20px',
//                       }}
//                     />
//                   </div>
//                 ),
//               },
//               {
//                 content: (item) => <div>{item.description}</div>,
//               },
//             ],
//           }}
//           cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 3 }]}
//           items={[
//             {
//               name: "Register for Upcoming Federal Funds Partnership Meetings",
//               external: true,
//               href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
//               img: "/images/Welcome/massFlag.png",
//               description:
//                 "FFIO leads the monthly Massachusetts Federal Funds Partnership meeting, which provides critical funding updates and addresses questions.",
//             },
//             {
//               name: "Federal Grant Application Resources",
//               external: true,
//               href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
//               img: "/images/Welcome/resourcesImage.png",
//               description: "Grant application resources sorted by policy area.",
//             },
//             {
//               name: "Prompt Suggestions for Effective Chatbot Use",
//               external: false,
//               href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
//               img: "/images/Welcome/promptSuggestions.png",
//               description:
//                 "Resource document with prompts to help users effectively interact with an AI chatbot designed to assist in understanding grant NOFOs, drafting narrative sections, refining drafts, addressing tone, anticipating reviewer feedback, and clarifying eligibility criteria.",
//             }
//           ]}
//         />
//       </SpaceBetween>
//     </Container>
//   );
// }