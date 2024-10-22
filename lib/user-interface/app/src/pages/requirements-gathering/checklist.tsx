import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Header, SpaceBetween, Button } from '@cloudscape-design/components';
import BaseAppLayout from '../../components/base-app-layout';
import ReqNav from '../../components/req-nav'; // Custom Navigation Component
import ReactMarkdown from 'react-markdown';


export default function Checklists() {
  // State to manage visibility of sections
  const [isProjectNarrativeOpen, setProjectNarrativeOpen] = useState(true);
  const [isEligibilityOpen, setEligibilityOpen] = useState(true);
  const [isDocumentsOpen, setDocumentsOpen] = useState(true);
  const [isDeadlinesOpen, setDeadlinesOpen] = useState(true);
  const { documentUrl } = useParams<{ documentUrl: string }>();

  const [llmData, setLlmData] = useState({
    eligibility: '',
    documents: '',
    narrative: '',
    deadlines: '',
  });

  useEffect(() => {
    setLlmData({
      narrative: `
- Project Description
- Project Budget
- Merit Criteria
- Project Readiness
- Benefit-Cost Analysis Narrative (capital projects only)
      `,
      eligibility: `
- Eligible applicants include State, local, Tribal, and U.S. territories governments, including transit agencies, port authorities, metropolitan planning organizations, and other political subdivisions of State or local governments.
- Multiple States or jurisdictions may submit a joint application and should identify a lead applicant as the primary point of contact.
- Each lead applicant may submit no more than three applications.
- Projects must have a total cost of at least $5 million for urban projects and at least $1 million for rural projects.
- Urban projects must have at least 20% in non-Federal funding. Rural projects must have at least 10% in non-Federal funding.
      `,
      documents: `
- SF-424
- Project Information Form (Excel file)
- Project Description (PDF)
- Project Location File
- Project Budget (PDF)
- Funding Commitment Documentation
- Merit Criteria Narrative (PDF)
- Project Readiness (PDF)
- Benefit-Cost Analysis Narrative (PDF, capital projects only)
- Benefit-Cost Analysis Calculations (Excel, capital projects only)
- Letters of Support (Optional)
      `,
      deadlines: `

- **FY 2024 Deadline:** February 28, 2024 at 11:59 pm Eastern
- **FY 2025 Deadline:** January 13, 2025 at 11:59 pm Eastern
- **FY 2026 Deadline:** January 13, 2026 at 11:59 pm Eastern
      `,
    });
  }, [documentUrl]);

  // Toggle section visibility
  const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  return (
    <BaseAppLayout
      navigation={<ReqNav />}
      content={
        <Box padding="m">
          <SpaceBetween size="l">
            <Header variant="h1">Requirements for Selected Grant Name</Header>
            <div>
              <h1>Requirements Gathering Page</h1>
              <p>You have selected the document:</p>
              <pre>{decodeURIComponent(documentUrl)}</pre>
              {/* Add your requirements gathering content here */}
            </div>

            {/* Project Narrative Section */}
            <Box>
              <Header variant="h2">Project Narrative Components</Header>
              <Button
                variant="icon"
                iconName={isProjectNarrativeOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setProjectNarrativeOpen)}
                ariaLabel="Toggle Project Narrative Section"
              />
              {isProjectNarrativeOpen && (
                <Box margin={{ top: 's' }}>
                  <ReactMarkdown>{llmData.narrative}</ReactMarkdown>
                </Box>
              )}
            </Box>

            {/* Eligibility Criteria Section */}
            <Box>
              <Header variant="h2">Eligibility Criteria</Header>
              <Button
                variant="icon"
                iconName={isEligibilityOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setEligibilityOpen)}
                ariaLabel="Toggle Eligibility Section"
              />
              {isEligibilityOpen && (
                <Box margin={{ top: 's' }}>
                  <ReactMarkdown>{llmData.eligibility}</ReactMarkdown>
                </Box>
              )}
            </Box>

            {/* Documents Required Section */}
            <Box>
              <Header variant="h2">Documents Required</Header>
              <Button
                variant="icon"
                iconName={isDocumentsOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setDocumentsOpen)}
                ariaLabel="Toggle Documents Section"
              />
              {isDocumentsOpen && (
                <Box margin={{ top: 's' }}>
                  <ReactMarkdown>{llmData.documents}</ReactMarkdown>
                </Box>
              )}
            </Box>

            {/* Key Deadlines Section */}
            <Box>
              <Header variant="h2">Key Deadlines</Header>
              <Button
                variant="icon"
                iconName={isDeadlinesOpen ? 'angle-down' : 'angle-right'}
                onClick={() => toggleSection(setDeadlinesOpen)}
                ariaLabel="Toggle Deadlines Section"
              />
              {isDeadlinesOpen && (
                <Box margin={{ top: 's' }}>
                  <ReactMarkdown>{llmData.deadlines}</ReactMarkdown>
                </Box>
              )}
            </Box>
          </SpaceBetween>
        </Box>
      }
    />
  );
}

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { Box, Header, SpaceBetween, Button } from '@cloudscape-design/components';
// import BaseAppLayout from '../../components/base-app-layout';
// import ReqNav from '../../components/req-nav'; // Custom Navigation Component

// export default function Checklists() {
//   // State to manage visibility of sections
//   const [isProjectNarrativeOpen, setProjectNarrativeOpen] = useState(true);
//   const [isEligibilityOpen, setEligibilityOpen] = useState(true);
//   const [isDocumentsOpen, setDocumentsOpen] = useState(true);
//   const [isDeadlinesOpen, setDeadlinesOpen] = useState(true);
//   const { documentUrl } = useParams<{ documentUrl: string }>();
//   const [llmData, setLlmData] = useState({
//     eligibility: '',
//     documents: '',
//     narrative: '',
//     deadlines: '',
//   });

//   useEffect(() => {
//     setLlmData({
//       narrative: `
//   **Narrative Sections**
//   - Project Description
//   - Project Budget
//   - Merit Criteria
//   - Project Readiness
//   - Benefit-Cost Analysis Narrative (capital projects only)
//       `,
//       eligibility: `
//   **Eligibility Criteria**
//   - Eligible applicants include State, local, Tribal, and U.S. territories governments, including transit agencies, port authorities, metropolitan planning organizations, and other political subdivisions of State or local governments.
//   - Multiple States or jurisdictions may submit a joint application and should identify a lead applicant as the primary point of contact.
//   - Each lead applicant may submit no more than three applications.
//   - Projects must have a total cost of at least $5 million for urban projects and at least $1 million for rural projects.
//   - Urban projects must have at least 20% in non-Federal funding. Rural projects must have at least 10% in non-Federal funding.
//       `,
//       documents: `
//   **Documents Required**
//   - SF-424
//   - Project Information Form (Excel file)
//   - Project Description (PDF)
//   - Project Location File
//   - Project Budget (PDF)
//   - Funding Commitment Documentation
//   - Merit Criteria Narrative (PDF)
//   - Project Readiness (PDF)
//   - Benefit-Cost Analysis Narrative (PDF, capital projects only)
//   - Benefit-Cost Analysis Calculations (Excel, capital projects only)
//   - Letters of Support (Optional)
//       `,
//       deadlines: `
//   **Key Deadlines**
//   - **FY 2024 Deadline:** February 28, 2024 at 11:59 pm Eastern
//   - **FY 2025 Deadline:** January 13, 2025 at 11:59 pm Eastern
//   - **FY 2026 Deadline:** January 13, 2026 at 11:59 pm Eastern
//       `,
//     });
//   }, [documentUrl]);
  

//   // Toggle section visibility
//   const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
//     setter((prev) => !prev);
//   };

//   return (
//     <BaseAppLayout
//       navigation={<ReqNav />}
//       content={
//         <Box padding="m">
//           <SpaceBetween size="l">
//             <Header variant="h1">Requirements for Selected Grant Name</Header>
//             <div>
//             <h1>Requirements Gathering Page</h1>
//             <p>You have selected the document:</p>
//             <pre>{decodeURIComponent(documentUrl)}</pre>
//             {/* Add your requirements gathering content here */}
//             </div>
//             {/* Project Narrative Section */}
//             <Box>
//               <Header variant="h2">Project Narrative Components</Header>
//               <Button
//                 variant="icon"
//                 iconName={isProjectNarrativeOpen ? 'angle-down' : 'angle-right'}
//                 onClick={() => toggleSection(setProjectNarrativeOpen)}
//                 ariaLabel="Toggle Project Narrative Section"
//               />
//               {isProjectNarrativeOpen && (
//                 <Box margin={{ top: 's' }}>{llmData.narrative}</Box>
//               )}
//             </Box>

//             {/* Eligibility Criteria Section */}
//             <Box>
//               <Header variant="h2">Eligibility Criteria</Header>
//               <Button
//                 variant="icon"
//                 iconName={isEligibilityOpen ? 'angle-down' : 'angle-right'}
//                 onClick={() => toggleSection(setEligibilityOpen)}
//                 ariaLabel="Toggle Eligibility Section"
//               />
//               {isEligibilityOpen && (
//                 <Box margin={{ top: 's' }}>{llmData.eligibility}</Box>
//               )}
//             </Box>

//             {/* Documents Required Section */}
//             <Box>
//               <Header variant="h2">Documents Required</Header>
//               <Button
//                 variant="icon"
//                 iconName={isDocumentsOpen ? 'angle-down' : 'angle-right'}
//                 onClick={() => toggleSection(setDocumentsOpen)}
//                 ariaLabel="Toggle Documents Section"
//               />
//               {isDocumentsOpen && (
//                 <Box margin={{ top: 's' }}>{llmData.documents}</Box>
//               )}
//             </Box>

//             {/* Key Deadlines Section */}
//             <Box>
//               <Header variant="h2">Key Deadlines</Header>
//               <Button
//                 variant="icon"
//                 iconName={isDeadlinesOpen ? 'angle-down' : 'angle-right'}
//                 onClick={() => toggleSection(setDeadlinesOpen)}
//                 ariaLabel="Toggle Deadlines Section"
//               />
//               {isDeadlinesOpen && (
//                 <Box margin={{ top: 's' }}>{llmData.deadlines}</Box>
//               )}
//             </Box>
//           </SpaceBetween>
//         </Box>
//       }
//     />
//   );
// }