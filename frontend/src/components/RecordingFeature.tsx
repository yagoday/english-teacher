import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Text, VStack, useToast } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Theme } from '../App';

// Define animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

interface RecordingFeatureProps {
  theme: Theme;
  onSpeechResult?: (text: string) => void;
}

export const RecordingFeature: React.FC<RecordingFeatureProps> = ({ 
  theme,
  onSpeechResult 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState<{ text: string; audioUrl?: string } | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const toast = useToast();

  // Function to play audio response
  const playAudioResponse = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio response',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  }, [toast]);

  // Effect to play audio when response changes
  useEffect(() => {
    if (aiResponse?.audioUrl) {
      playAudioResponse(aiResponse.audioUrl);
    }
  }, [aiResponse, playAudioResponse]);

  useEffect(() => {
    // Request microphone access when component mounts
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        
        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          await convertAndSendAudio(audioBlob);
          audioChunks.current = [];
        };
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
        toast({
          title: 'Microphone Error',
          description: 'Please make sure you have given permission to use the microphone.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  }, [toast]);

  const processWithAI = async (text: string) => {
    try {
      const response = await fetch('/api/speech/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      if (data.success) {
        setAiResponse(data.response);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('AI processing error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const convertAndSendAudio = async (webmBlob: Blob) => {
    try {
      // Convert WebM to MP3 using FFmpeg.wasm or other library
      const formData = new FormData();
      formData.append('audio', webmBlob, 'recording.webm');

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      if (data.success) {
        setTranscription(data.text);
        onSpeechResult?.(data.text);
        // Process the transcribed text with AI
        await processWithAI(data.text);
      } else {
        throw new Error(data.error || 'Failed to transcribe audio');
      }
    } catch (error: any) {
      console.error('Error sending audio:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process audio. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
      try {
        mediaRecorder.current.start(1000); // Collect data every second
        setIsRecording(true);
        setIsProcessing(false);
        setTranscription('');
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast({
          title: 'Error',
          description: 'Failed to start recording. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        mediaRecorder.current.stop();
      } catch (error) {
        console.error('Failed to stop recording:', error);
        setIsProcessing(false);
      }
    }
  }, []);

  const getButtonStyles = () => {
    const baseStyles = {
      size: "lg",
      width: "120px",
      height: "120px",
      borderRadius: "full",
      transition: "all 0.2s",
      position: "relative" as const,
      _before: {
        content: '""',
        position: "absolute",
        top: "-2px",
        right: "-2px",
        bottom: "-2px",
        left: "-2px",
        borderRadius: "full",
        transition: "all 0.2s",
      }
    };

    if (isProcessing) {
      return {
        ...baseStyles,
        bg: 'green.200',
        _hover: { transform: 'none' },
        opacity: 0.8,
      };
    }

    if (isRecording) {
      return {
        ...baseStyles,
        animation: `${pulse} 1.5s ease-in-out infinite`,
        bg: theme === 'panda' ? 'red.400' : 'red.500',
        _hover: { transform: 'none' },
      };
    }

    return {
      ...baseStyles,
      bg: theme === 'panda' ? 'green.400' : 'blue.400',
      _hover: {
        transform: 'scale(1.05)',
        bg: theme === 'panda' ? 'green.500' : 'blue.500',
      },
    };
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Listening...';
    return 'Ready';
  };

  const getStatusText = () => {
    if (isProcessing) return 'Converting speech to text...';
    if (isRecording) return 'I\'m listening to you...';
    return 'Click the button and start speaking in English';
  };

  return (
    <VStack spacing={6} align="center">
      <Button
        {...getButtonStyles()}
        onClick={isRecording ? stopRecording : startRecording}
        isLoading={isProcessing}
        loadingText="Processing..."
      >
        {getButtonText()}
      </Button>
      
      <Text 
        color="gray.600" 
        fontSize="lg"
        opacity={isProcessing || isRecording ? 1 : 0.8}
        transition="all 0.3s"
      >
        {getStatusText()}
      </Text>

      {transcription && (
        <Text color="gray.700" fontSize="md">
          You said: {transcription}
        </Text>
      )}

      {aiResponse && (
        <Text color="blue.600" fontSize="md">
          Teacher: {aiResponse.text}
        </Text>
      )}
    </VStack>
  );
}; 