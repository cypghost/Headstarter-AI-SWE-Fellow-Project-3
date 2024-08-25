"use client";
import {
  Box,
  Stack,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpward } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import IntroMessage from "./components/IntroMessage";
import Image from "next/image.js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Rate your Professor support assistant. How can I help you today?`,
    },
  ]);

  useEffect(() => {
    // This will scroll to the bottom of the chat whenever the messages state changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (introVisible) {
      setIntroVisible(false);
    }

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    setIsLoading(true);
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      if (!res.body) {
        throw new Error("Response body is null");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      setIsLoading(false);

      return reader
        .read()
        .then(function processText({ done, value }): Promise<string> {
          if (done) {
            return Promise.resolve(result);
          }
          const text = decoder.decode(value || new Uint8Array(), {
            stream: true,
          });
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ];
          });
          return reader.read().then(processText);
        });
    });
  };

  if (loading) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
    >
      <IntroMessage introVisible={introVisible} />
      <Stack
        direction="column"
        width="100%"
        maxWidth="690px"
        height="70%"
        borderRadius={2}
        bgcolor="rgba(245, 245, 245, 0.8)"
        py={2}
        px={1}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          fontSize={14}
          paddingX={2}
          sx={{
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#ddd",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#333",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={message.role === "assistant" ? "#333" : "#f0f0f0"}
                color={message.role === "assistant" ? "#f0f0f0" : "#333"}
                borderRadius={5}
                boxShadow={5}
                p={2}
                maxWidth="80%"
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}

          <div ref={messagesEndRef} />
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        borderRadius={10}
        boxShadow={3}
        sx={{
          maxWidth: "690px",
          width: "100%",
          maxHeight: "60px",
          bgcolor: "#fafafa",
          border: "1px solid #333",
        }}
      >
        <TextField
          placeholder="Ask the Rate your Professor Bot anything.."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
              bgcolor: "#fafafa",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              boxShadow: "none",
              "& fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input": {
              padding: "13px 20px",
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={isLoading || !message.trim()}
          sx={{
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            color: "#333",
            "&:hover": {
              bgcolor: "#e0e0e0",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : <ArrowUpward />}
        </IconButton>
      </Stack>
    </Box>
  );
}
