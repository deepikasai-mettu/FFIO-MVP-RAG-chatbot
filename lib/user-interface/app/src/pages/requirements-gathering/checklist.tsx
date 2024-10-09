// checklists.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, SpaceBetween, Container, Button, Textarea, Spinner } from '@cloudscape-design/components';
import axios from 'axios';

function Checklists() {
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const { documentUrl } = useParams(); // Use document URL passed as a parameter

  // Function to handle LLM interaction
  const generateText = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/generate_text', { documentUrl });
      setGeneratedText(response.data);
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header variant="h1">Document Analysis and LLM Output</Header>
      <SpaceBetween size="l">
        <Button onClick={generateText} variant="primary">
          Generate Text
        </Button>
        {loading && <Spinner size="large" />}
        {generatedText && (
          <Textarea value={generatedText} readOnly rows={10} placeholder="Generated text will appear here." />
        )}
      </SpaceBetween>
    </Container>
  );
}

export default Checklists;















// function NOFOProcessor() {
//   const [selectedDocument, setSelectedDocument] = useState<any>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [processing, setProcessing] = useState<boolean>(false);
//   const [checklists, setChecklists] = useState<any>(null);
//   const [grantName, setGrantName] = useState<string>("");

//   // Function to extract text from PDF
//   const extractTextFromPdf = async (file: File) => {
//     const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
//     let text = "";
//     for (let i = 0; i < pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       text += content.items.map((item: any) => item.str).join(" ");
//     }
//     return text;
//   };

//   // Function to extract text from DOCX
//   const extractTextFromDocx = async (file: File) => {
//     const reader = new FileReader();
//     return new Promise<string>((resolve) => {
//       reader.onload = (event: any) => {
//         const arrayBuffer = event.target.result;
//         const doc = new Document(arrayBuffer);
//         let text = doc.paragraphs.map((para: Paragraph) => para.text).join("\n");
//         resolve(text);
//       };
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   // Function to extract relevant sentences
//   const extractRelevantSentences = (text: string) => {
//     const keywords = ["eligibility", "deadline", "requirement", "submission", "application", "criteria", "documents", "narrative", "sections"];
//     return text
//       .split(".")
//       .filter((sentence) =>
//         keywords.some((keyword) => sentence.toLowerCase().includes(keyword))
//       )
//       .join(". ");
//   };

//   // Handle file upload and process it
//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file to upload.");
//       return;
//     }

//     setProcessing(true);

//     let NOFOText = "";

//     // Extract text based on file type
//     if (file.name.endsWith(".pdf")) {
//       NOFOText = await extractTextFromPdf(file);
//     } else if (file.name.endsWith(".docx")) {
//       NOFOText = await extractTextFromDocx(file);
//     } else {
//       alert("Unsupported file type.");
//       setProcessing(false);
//       return;
//     }

//     // Extract relevant sentences
//     const preprocessedText = extractRelevantSentences(NOFOText);

//     // Send to the backend for further processing
//     try {
//       const response = await axios.post("/api/process_nofo", { text: preprocessedText });
//       setChecklists(response.data.checklists);
//       setGrantName(response.data.grant_name);
//     } catch (error) {
//       console.error("Error processing NOFO", error);
//     }

//     setProcessing(false);
//   };

//   return (
//     <Container>
//       <Header variant="h1">NOFO Document Processor</Header>
//       <SpaceBetween size="l">
//         {/* Upload file */}
//         <Box>
//           <input
//             type="file"
//             accept=".pdf,.docx"
//             onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
//           />
//           <Button onClick={handleUpload} variant="primary">
//             Upload and Process
//           </Button>
//         </Box>

//         {/* Show processing spinner */}
//         {processing && <Spinner />}

//         {/* Display grant name and checklist */}
//         {checklists && (
//           <Box>
//             <Header variant="h2">Grant: {grantName}</Header>
//             <Box>
//               <strong>Documents Required:</strong>
//               <ul>
//                 {checklists.documents_required.map((item: string, index: number) => (
//                   <li key={index}>{item}</li>
//                 ))}
//               </ul>
//             </Box>
//             <Box>
//               <strong>Narrative Sections:</strong>
//               <ul>
//                 {checklists.narrative_sections.map((item: string, index: number) => (
//                   <li key={index}>{item}</li>
//                 ))}
//               </ul>
//             </Box>
//             <Box>
//               <strong>Eligibility Criteria:</strong>
//               <ul>
//                 {checklists.eligibility_criteria.map((item: string, index: number) => (
//                   <li key={index}>{item}</li>
//                 ))}
//               </ul>
//             </Box>
//             <Box>
//               <strong>Key Deadlines:</strong>
//               <ul>
//                 {checklists.key_deadlines.map((item: string, index: number) => (
//                   <li key={index}>{item}</li>
//                 ))}
//               </ul>
//             </Box>
//           </Box>
//         )}
//       </SpaceBetween>
//     </Container>
//   );
// }


