
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPanel = () => {
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [speakingSpeed, setSpeakingSpeed] = useState([1.0]);
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");
  const [tutorVoice, setTutorVoice] = useState("female1");

  return (
    <div className="py-6 space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your learning profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://github.com/shadcn.png" alt="Student" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">Young Learner</p>
              <p className="text-sm text-muted-foreground">Level: Beginner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Audio Settings</CardTitle>
          <CardDescription>Customize how audio works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-play" className="flex-grow">Auto-play tutor voice</Label>
            <Switch 
              id="auto-play" 
              checked={autoPlayAudio} 
              onCheckedChange={setAutoPlayAudio} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="speaking-speed">Speaking Speed: {speakingSpeed[0]}x</Label>
            <Slider 
              id="speaking-speed" 
              min={0.5} 
              max={2} 
              step={0.1} 
              value={speakingSpeed} 
              onValueChange={setSpeakingSpeed} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tutor-voice">Tutor Voice</Label>
            <Select value={tutorVoice} onValueChange={setTutorVoice}>
              <SelectTrigger id="tutor-voice">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female1">Female 1</SelectItem>
                <SelectItem value="female2">Female 2</SelectItem>
                <SelectItem value="male1">Male 1</SelectItem>
                <SelectItem value="male2">Male 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Learning Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Learning Settings</CardTitle>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty-level">Difficulty Level</Label>
            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger id="difficulty-level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
