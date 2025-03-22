import React from 'react';
import { Box, Container, Heading, VStack } from '@chakra-ui/react';
import { RecordingFeature } from './components/RecordingFeature';

export type Theme = 'panda' | 'vader';

function App() {
  const handleSpeechResult = (text: string) => {
    console.log('Speech result:', text);
    // Here you can add logic to process the speech result
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.md">
        <VStack spacing={8}>
          <Heading as="h1" size="xl" textAlign="center" color="gray.700">
            English Learning Assistant
          </Heading>
          <RecordingFeature 
            theme="panda"
            onSpeechResult={handleSpeechResult}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
