import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Theme } from './MainLearningInterface';

interface StreamingFeedbackProps {
  feedback: string;
  theme: Theme;
}

export const StreamingFeedback: React.FC<StreamingFeedbackProps> = ({
  feedback,
  theme,
}) => {
  if (!feedback) return null;

  return (
    <Box
      p={6}
      bg={theme === 'panda' ? 'green.50' : 'red.50'}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={theme === 'panda' ? 'green.200' : 'red.200'}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: '-10px',
        left: '20px',
        borderWidth: '0 10px 10px 10px',
        borderColor: `transparent transparent ${
          theme === 'panda' ? 'var(--chakra-colors-green-50)' : 'var(--chakra-colors-red-50)'
        } transparent`,
        borderStyle: 'solid',
      }}
    >
      <Text
        color={theme === 'panda' ? 'green.800' : 'red.800'}
        fontSize="lg"
        fontWeight="medium"
      >
        {feedback}
      </Text>
    </Box>
  );
}; 