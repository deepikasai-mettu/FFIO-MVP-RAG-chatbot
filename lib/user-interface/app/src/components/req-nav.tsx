import React, { useState } from 'react';
import { Box, Header, SpaceBetween } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import RouterButton from './wrappers/router-button';

export default function ReqNav() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  return (
    <Box margin="xs" padding={{ top: "l" }} textAlign="center">
      <SpaceBetween size="l">
        <Header variant="h2">Manage application sessions</Header>
        <RouterButton
          iconAlign="right"
          variant="primary"
          href={`/chatbot/playground/${uuidv4()}`}
          data-alignment="right"
          className="new-chat-button"
          style={{ textAlign: "right" }}
        >
          Start new application
        </RouterButton>
      </SpaceBetween>
    </Box>
  );
}