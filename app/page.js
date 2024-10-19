'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        bgcolor: 'white',  // White background
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: 600,
          bgcolor: 'white',  // White background
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'auto',
          padding: 2,
          color: 'black',  // Black text
        }}
      >
        <Stack
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: '70vh',
            padding: 2,
          }}
        >
          {messages.map((message, index) => (
            <div key={index} style={{ marginBottom: '1rem', color: 'black' }}>
              <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
              <p>{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              bgcolor: 'white',  // White background
              color: 'black',    // Black text
            }}
            InputLabelProps={{ style: { color: 'black' } }} // Label color
            InputProps={{
              style: { color: 'black' }, // Text input color
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ color: 'white', bgcolor: 'black' }}  // Black button with white text
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
