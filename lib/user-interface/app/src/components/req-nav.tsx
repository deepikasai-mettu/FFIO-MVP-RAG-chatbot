// src/user-interface/components/req-nav.tsx

import React, { useState } from 'react';
import { Box, Button, Header, SpaceBetween } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";

export default function ReqNav() {
  const navigate = useNavigate(); // Hook for page navigation
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen); // Toggle drawer visibility
  };

  // const handleNavigation = (path: string) => {
  //   navigate(path); // Handle navigation between pages
  // };

  return (
    <Box
      position="fixed"
      left={isDrawerOpen ? '0' : '-300px'} // Slide-in effect
      width="300px"
      height="100%"
      backgroundColor="light"
      boxShadow="medium"
      padding="l"
      transition="left 0.3s ease-in-out"
      zIndex={1000}

    >
      <SpaceBetween size="l">
        <Header variant="h2">Manage application sessions</Header>
        <Button onClick={() => navigate(
        `/chatbot/playground/${uuidv4()}`
      )}>Start new application for x grant</Button>
      </SpaceBetween>
    </Box>
  );
}
