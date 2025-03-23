import React, { useState, useRef, useEffect } from "react";
import { ThumbsDown, ThumbsUp, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: "student" | "tutor";
    audioUrl?: string;
    timestamp: Date;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isTutor = message.sender === "tutor";

  useEffect(() => {
    if (message.audioUrl && isTutor) {
      // Create a new audio element
      const audio = new Audio();
      
      // Set playback rate to 0.8 (20% slower)
      audio.playbackRate = 1.0;
      
      // Set up event listeners before setting the source
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setAudioError(true);
        setIsPlaying(false);
      });

      audio.addEventListener('canplaythrough', async () => {
        try {
          setAudioError(false);
          // Ensure playback rate is set before playing
          audio.playbackRate = 0.8;
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Auto-play error:', error);
          setAudioError(true);
        }
      }, { once: true });

      // For base64 data URLs, we need to handle them directly
      if (message.audioUrl.startsWith('data:audio')) {
        audio.src = message.audioUrl;
      } else {
        // For regular URLs, we might want to construct a full URL
        audio.src = message.audioUrl;
      }

      // Store the audio element
      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.remove();
          audioRef.current = null;
        }
      };
    }
  }, [message.audioUrl, isTutor]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(false); // Reset error state on new play attempt
        // Ensure playback rate is set before playing
        audioRef.current.playbackRate = 0.8;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false); // Ensure only one can be active at a time
    // In a real implementation, this would send feedback to the backend
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false); // Ensure only one can be active at a time
    // In a real implementation, this would send feedback to the backend
  };

  return (
    <div
      className={cn(
        "w-full max-w-[85%] p-4 rounded-2xl animate-fade-in mb-4 shadow-sm",
        isTutor 
          ? "tutor-message self-start rounded-bl-sm" 
          : "student-message self-end rounded-br-sm"
      )}
    >
      <div className="mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider">
          {isTutor ? "Tutor" : "You"}
        </span>
      </div>
      
      <p className="text-sm md:text-base">{message.text}</p>
      
      {isTutor && message.audioUrl && (
        <div className="flex items-center mt-3 gap-3">
          <button
            onClick={handlePlayPause}
            disabled={audioError}
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full transition-colors",
              audioError 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-tutor/10 text-tutor hover:bg-tutor/20"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>
          
          {isPlaying && !audioError && (
            <div className="audio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          {audioError && (
            <span className="text-xs text-red-500">Failed to play audio</span>
          )}
          
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full transition-colors",
                liked 
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
              aria-label="I understand"
            >
              <ThumbsUp size={14} />
            </button>
            
            <button
              onClick={handleDislike}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full transition-colors",
                disliked 
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
              aria-label="I don't understand"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
