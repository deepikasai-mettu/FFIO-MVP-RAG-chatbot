import React, { useState } from 'react';
import { Box, Header, SpaceBetween, Cards, Link } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import RouterButton from './wrappers/router-button'
import PencilSquareIcon from "../../public/images/pencil-square.jsx";;

export default function ReqNav() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  return (
    <Box margin="m" padding={{ top: "l" }} textAlign="center">
      <SpaceBetween size="xl">
      <Header 
      variant="h1">GrantWell</Header>
      <SpaceBetween size="xl">
      {/* <h3 style={{ fontSize: '20px', marginBottom: '0px', fontFamily: 'Arial' }}>
        Start an Application for This NOFO
      </h3>
        <RouterButton
          iconAlign="right"
          variant="primary"
          href={`/chatbot/playground/${uuidv4()}`}
          data-alignment="right"
          className="new-chat-button"
          style={{ textAlign: "right" }}
        >
          Go To Chatbot
        </RouterButton>
        </SpaceBetween>
        <SpaceBetween size="xl"></SpaceBetween>
        <SpaceBetween size="xl"></SpaceBetween>
        <SpaceBetween size="xl"></SpaceBetween>
      <SpaceBetween size="xl">
      <h3 style={{ fontSize: '20px', marginBottom: '0px', fontFamily: 'Arial' }}>
        Back to NOFO Selection
      </h3>
        <RouterButton
          iconAlign="right"
          variant="primary"
          href={`/landing-page/basePage`}
          data-alignment="right"
          className="new-chat-button"
          style={{ textAlign: "right" }}
        >
          Home
        </RouterButton> */}
      </SpaceBetween>
      </SpaceBetween>
      <Cards
          cardDefinition={{
            header: (item) => (
              <Link href={item.href} external={item.external} fontSize="heading-l">
                {item.name}
              </Link>
            ),
            sections: [
              {
                content: (item) => (
                  <div style={{ minHeight: '10px' }}>
                    <img
                      src={item.img}
                      alt="Placeholder"
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '10px',
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
          cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 1 }]}
          items={[
            {
              name: "Write a Proposal for This Grant",
              external: false,
              //href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
              href: "/chatbot/playground/${uuidv4()}",
              img: "/images/Welcome/massFlag.png",
              description:
                "The GrantWell chatbot allows you to upload data and converse with a chatbot to craft the perfect project narrative for your grant proposal.",
            },
            {
              name: "Return to Homepage",
              external: false,
              //href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
              href: "/landing-page/basePage",
              img: "/images/Welcome/resourcesImage.png",
              description: "Return to NOFO selection.",
            },
          ]}
        />
    </Box>
  );
}


// import React, { useState } from 'react';
// import { Box, Button, Header, SpaceBetween } from '@cloudscape-design/components';
// import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from "uuid";

// export default function ReqNav() {
//   const navigate = useNavigate(); // Hook for page navigation
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

//   const toggleDrawer = () => {
//     setIsDrawerOpen(!isDrawerOpen); // Toggle drawer visibility
//   };

//   // const handleNavigation = (path: string) => {
//   //   navigate(path); // Handle navigation between pages
//   // };

//   return (
//     <Box
//       position="fixed"
//       left={isDrawerOpen ? '0' : '-300px'} // Slide-in effect
//       width="300px"
//       height="100%"
//       backgroundColor="light"
//       boxShadow="medium"
//       padding="l"
//       transition="left 0.3s ease-in-out"
//       zIndex={1000}

//     >
// <StyledBox isDrawerOpen={isDrawerOpen}>
    //   <SpaceBetween size="l">
    //     <Header variant="h2">Manage application sessions</Header>
    //     <Button
    //       onClick={() => navigate(`/chatbot/playground/${uuidv4()}`)}
    //     >
    //       Start new application for x grant
    //     </Button>
    //   </SpaceBetween>
    // </StyledBox>
//       <SpaceBetween size="l">
//         <Header variant="h2">Manage application sessions</Header>
//         <Button onClick={() => navigate(
//         `/chatbot/playground/${uuidv4()}`
//       )}>Start new application for x grant</Button>
//       </SpaceBetween>
//     </Box>
//   );
// }