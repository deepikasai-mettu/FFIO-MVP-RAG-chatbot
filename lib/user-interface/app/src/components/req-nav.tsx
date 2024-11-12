import React, { useState } from 'react';
import { Box, Header, SpaceBetween, Button, Cards, Link } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";

export default function ReqNav({ documentIdentifier }) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  console.log("REQ NAV: ", documentIdentifier);

  return (
    <Box margin="m" padding={{ top: "l" }} textAlign="center">
      <SpaceBetween size="xl">
        <Header variant="h1">GrantWell</Header>

        {/* Return to Home Page Button */}
        <Button 
          onClick={() => navigate('/landing-page/basePage')}
          variant="primary"
          aria-label="Return to Home Page"
        >
          Return to Home Page
        </Button>

        {/* Spacer for Centering */}
        <div style={{ marginTop: '50px' }}></div>

        {/* Centered "Write a Proposal" Card */}
        <Cards
          cardDefinition={{
            header: (item) => (
              <Link href={item.href} external={item.external} fontSize="heading-l">
                {item.name}
              </Link>
            ),
            sections: [
              {
                content: (item) => <div>{item.description}</div>,
              },
            ],
          }}
          cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 1 }]}
          items={[
            {
              name: "Write a Proposal for This Grant",
              external: false,
              href: `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(documentIdentifier)}`,
              description:
                "The GrantWell chatbot allows you to upload data and converse with a chatbot to craft a comprehensive project narrative for your grant proposal.",
            },
          ]}
        />
      </SpaceBetween>
    </Box>
  );
}


// import React, { useState } from 'react';
// import { Box, Header, SpaceBetween, Button, Cards, Link} from '@cloudscape-design/components';
// import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from "uuid";

// export default function ReqNav({ documentIdentifier }) {
//   const navigate = useNavigate();
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);

//   console.log("REQ NAV: ", documentIdentifier);

//   return (
//     <Box margin="m" padding={{ top: "l" }} textAlign="center">
//       <SpaceBetween size="xl">
//         <Header variant="h1">GrantWell</Header>

//         {/* Return to Home Page Button */}
//         <Button 
//           onClick={() => navigate('/landing-page/basePage')}
//           variant="primary"
//           aria-label="Return to Home Page"
//         >
//           Return to Home Page
//         </Button>
        
//         {/* Existing Cards Component for Chatbot */}
//         <Cards
//           cardDefinition={{
//             header: (item) => (
//               <Link href={item.href} external={item.external} fontSize="heading-l">
//                 {item.name}
//               </Link>
//             ),
//             sections: [
//               {
//                 content: (item) => (
//                   <div style={{ minHeight: '10px' }}>
//                     <img
//                       src={item.img}
//                       alt="Placeholder"
//                       style={{
//                         width: '100%',
//                         height: '100px',
//                         objectFit: 'cover',
//                         borderRadius: '10px',
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
//           cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 1 }]}
//           items={[
//             {
//               name: "Write a Proposal for This Grant",
//               external: false,
//               href: `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(documentIdentifier)}`,
//               img: "/images/Welcome/massFlag.png",
//               description:
//                 "The GrantWell chatbot allows you to upload data and converse with a chatbot to craft a comprehensive project narrative for your grant proposal.",
//             },
//           ]}
//         />
//       </SpaceBetween>
//     </Box>
//   );
// }
