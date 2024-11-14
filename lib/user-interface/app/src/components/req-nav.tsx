import React, { useState } from 'react';
import { Box, Header, SpaceBetween, Button, Cards, Link } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import PencilSquareIcon from "../../public/images/pencil-square.jsx";
import BackArrowIcon from "../../public/images/back-arrow.jsx";

export default function ReqNav({ documentIdentifier }) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  console.log("REQ NAV: ", documentIdentifier);
  const linkUrl = `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(documentIdentifier)}`;

  return (
    <Box margin="xl" textAlign="left">
      <SpaceBetween size="xl">
      <Button 
          onClick={() => navigate('/landing-page/basePage')}
          variant="primary"
          aria-label="Return to Home Page"
          iconSvg={<BackArrowIcon />}
        >
          Back to Home
        </Button>
        <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '0px' }}>
          <Link href={linkUrl}>
          <h2 style={{ fontSize: '24px', display: 'inline', color: '#0073bb' }}>Click Here to Start a Proposal For This Grant</h2>
          </Link>
          <p style={{ fontSize: '16px', color: '#555' }}>
          The GrantWell chatbot allows you to upload data and converse with a chatbot to craft a comprehensive project narrative for your grant proposal.
          </p>
        </div>
      <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #d1e3f0', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px' }}>We Value Your Feedback!</h2>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Your insights are essential to helping us improve the GrantWell tool. If you have any general feedback, suggestions on current features, or ideas for new functionalities, please take a moment to fill out our <Link href="https://forms.gle/jNHk8usCSNBzhL998" external>Google Form</Link> to share your thoughts.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            We’re committed to making GrantWell as effective and user-friendly as possible, and we’ll do our best to incorporate your feedback into future updates.
          </p>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Thank you for helping us make GrantWell better for everyone!
          </p>
        </div>
        </SpaceBetween>
    </Box>
  );
}
