import OpenAI from "openai";

export class SpeechUtils {
  private openAIClient: OpenAI;
  private audioCache: Map<string, string>;
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached items
  private readonly MAX_PHRASE_LENGTH = 50; // Maximum characters in a cached phrase

  constructor(openAIClient: OpenAI) {
    this.openAIClient = openAIClient;
    this.audioCache = new Map();
  }

  /**
   * Split text into meaningful phrases for caching
   */
  splitIntoPhrases(text: string): string[] {
    // Split on common punctuation that indicates phrase boundaries
    const rawPhrases = text.split(/([,.!?])\s+/);
    const phrases: string[] = [];
    
    let currentPhrase = '';
    for (const phrase of rawPhrases) {
      if (!phrase.trim()) continue;
      
      // If adding this phrase would exceed MAX_PHRASE_LENGTH, store current and start new
      if ((currentPhrase + ' ' + phrase).length > this.MAX_PHRASE_LENGTH && currentPhrase) {
        phrases.push(currentPhrase.trim());
        currentPhrase = phrase;
      } else {
        currentPhrase = currentPhrase ? `${currentPhrase} ${phrase}` : phrase;
      }
    }
    
    if (currentPhrase) {
      phrases.push(currentPhrase.trim());
    }

    return phrases.filter(p => p.length > 0);
  }

  /**
   * Generate speech for a single phrase
   */
  async generateSpeechForPhrase(phrase: string): Promise<string> {
    const cacheKey = phrase.toLowerCase().trim();

    // Check cache first
    const cachedAudio = this.audioCache.get(cacheKey);
    if (cachedAudio) {
      console.debug(`Cache hit for phrase: "${phrase}"`);
      return cachedAudio;
    }

    // console.debug(`Cache miss for phrase: "${phrase}"`);
    try {
      const mp3 = await this.openAIClient.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: phrase,
      });

      const arrayBuffer = await mp3.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');
      const base64Data = `data:audio/mp3;base64,${base64String}`;

      // Cache the result if it's not too large
      if (base64Data.length < 1024 * 1024) { // 1MB limit for phrase cache
        if (this.audioCache.size >= this.MAX_CACHE_SIZE) {
          const firstKey = this.audioCache.keys().next().value;
          this.audioCache.delete(firstKey);
        }
        this.audioCache.set(cacheKey, base64Data);
        // console.debug(`Cached phrase: "${phrase}"`);
      }

      return base64Data;
    } catch (error) {
      console.error('Error generating speech for phrase:', phrase, error);
      return '';
    }
  }

  /**
   * Concatenate multiple base64 audio strings
   */
  async concatenateAudioBase64(base64Audios: string[]): Promise<string> {
    try {
      // Extract the actual base64 data from each string (remove the data:audio/mp3;base64, prefix)
      const buffers = base64Audios.map(base64Audio => {
        const base64Data = base64Audio.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      });

      // Concatenate all buffers
      const concatenatedBuffer = Buffer.concat(buffers);
      
      // Convert back to base64 with the proper prefix
      return `data:audio/mp3;base64,${concatenatedBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error concatenating audio:', error);
      // Return the first audio segment as fallback
      return base64Audios[0];
    }
  }

  /**
   * Generate speech from text using OpenAI TTS with phrase-level caching
   */
  async generateSpeech(text: string): Promise<string> {
    const startTime = Date.now();
    console.debug('Starting TTS generation for text:', text);

    // Split into phrases
    const phrases = this.splitIntoPhrases(text);
   // console.debug('Split into phrases:', phrases);

    // Generate audio for each phrase (potentially from cache)
    const audioPromises = phrases.map(phrase => this.generateSpeechForPhrase(phrase));
    const audioResults = await Promise.all(audioPromises);

    // Filter out any failed generations
    const validAudioResults = audioResults.filter(audio => audio.length > 0);

    if (validAudioResults.length === 0) {
      console.error('No valid audio generated for any phrase');
      return '';
    }

    // If we only have one phrase, return it directly
    if (validAudioResults.length === 1) {
      console.debug(`Single phrase TTS completed in ${Date.now() - startTime}ms`);
      return validAudioResults[0];
    }

    // Concatenate all audio segments
    console.debug(`Concatenating ${validAudioResults.length} audio segments`);
    const concatenatedAudio = await this.concatenateAudioBase64(validAudioResults);
    console.debug(`Multi-phrase TTS completed in ${Date.now() - startTime}ms`);
    return concatenatedAudio;
  }

  /**
   * Clear the audio cache
   */
  clearAudioCache(): void {
    this.audioCache.clear();
    console.debug('Audio cache cleared');
  }
} 