import React, { useState, useRef } from "react";
import { Mic, Send, X, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { speechApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import ThinkingIndicator from './ThinkingIndicator';

export interface RecordButtonProps {
  onRecordingComplete: (text: string) => void;
  disabled?: boolean;
  isThinking?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onRecordingComplete, disabled, isThinking }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await speechApi.transcribeAudio(formData);
          if (response.success && response.text) {
            onRecordingComplete(response.text);
          } else {
            toast({
              title: "Transcription failed",
              description: response.error || "Failed to transcribe audio",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process recording",
            variant: "destructive",
          });
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      // Store interval ID in the component instance
      (window as any).recordingInterval = interval;
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval((window as any).recordingInterval);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      clearInterval((window as any).recordingInterval);
      chunksRef.current = [];
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 py-2">
      {isRecording && (
        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full py-1 px-3 shadow-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-destructive animate-recording-pulse mr-2"></span>
          <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          
          <button
            onClick={cancelRecording}
            className="ml-2 p-1 rounded-full text-gray-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Cancel recording"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Button
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isThinking}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      <div className="flex-1 flex justify-center">
        {isThinking && !isRecording && (
          <div className="animate-fade-in">
            <ThinkingIndicator />
          </div>
        )}
      </div>
      
      {isRecording && (
        <div className="flex-1 h-10 rounded-full bg-white/50 backdrop-blur-sm animate-fade-in">
          <div className="h-full w-full flex items-center justify-center">
            <div className="audio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordButton;
