import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { Theme } from '../App';

interface ThemeSelectorProps {
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  return (
    <HStack spacing={4} justify="center" mb={8}>
      <Button
        colorScheme="green"
        variant={selectedTheme === 'panda' ? 'solid' : 'outline'}
        onClick={() => onThemeChange('panda')}
        size="lg"
      >
        Friendly Panda
      </Button>
      <Button
        colorScheme="red"
        variant={selectedTheme === 'darth-vader' ? 'solid' : 'outline'}
        onClick={() => onThemeChange('darth-vader')}
        size="lg"
      >
        Darth Vader
      </Button>
    </HStack>
  );
}; 