import React from "react";
import { Box, Typography, Collapse } from "@mui/material";

interface IntroMessageProps {
  introVisible: boolean;
}

const IntroMessage: React.FC<IntroMessageProps> = ({ introVisible }) => {
  return (
    <Collapse in={introVisible} timeout={600}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        maxWidth="820px"
        width="100%"
        textAlign="center"
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            marginTop: 1,
            marginBottom: 1,
            fontFamily: "'Nunito', sans-serif",
            lineHeight: "40px",
            color: "#5e3557",
          }}
        >
          Rate your Professor AI
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            marginBottom: 0.5,
            fontFamily: "'Nunito', sans-serif",
            color: "#5e3557",
          }}
        >
          Discover the Ratings of Your Professors
        </Typography>
        <Typography
          sx={{
            marginBottom: 1,
            fontFamily: "'Nunito', sans-serif",
            fontSize: "14px",
            color: "#5e3557",
          }}
        >
          Get instant insights about your professors with our powerful
          AI-powered chatbot.
        </Typography>
      </Box>
    </Collapse>
  );
};

export default IntroMessage;
