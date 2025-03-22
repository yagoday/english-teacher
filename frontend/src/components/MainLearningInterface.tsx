import React, { useState } from 'react';
import { Box, Container, VStack, Heading } from '@chakra-ui/react';
import { RecordingFeature } from './RecordingFeature';
import { ThemeSelector } from './ThemeSelector';
import { StreamingFeedback } from './StreamingFeedback';

export type Theme = 'panda' | 'darth-vader';

export const MainLearningInterface: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('panda');
  const [transcription, setTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const handleSpeechResult = (text: string) => {
    setTranscription(text);
    // TODO: Send to backend for processing
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading
            as="h1"
            size="xl"
            mb={2}
            color={selectedTheme === 'panda' ? 'green.500' : 'red.500'}
          >
            English Learning Adventure
          </Heading>
          <Heading as="h2" size="md" color="gray.600">
            Speak and Learn with {selectedTheme === 'panda' ? 'Friendly Panda' : 'Darth Vader'}
          </Heading>
        </Box>

        <ThemeSelector selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />
        
        <RecordingFeature onSpeechResult={handleSpeechResult} theme={selectedTheme} />
        
        {transcription && (
          <Box p={4} bg="white" rounded="md" shadow="sm">
            <Heading as="h3" size="sm" mb={2}>
              You said:
            </Heading>
            <Box color="gray.700">{transcription}</Box>
          </Box>
        )}

        <StreamingFeedback feedback={feedback} theme={selectedTheme} />
      </VStack>
    </Container>
  );
}; 