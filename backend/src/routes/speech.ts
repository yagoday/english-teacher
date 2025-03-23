import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'ffmpeg-static';
import { EnglishTeacherOrchestrator } from '../agents/EnglishTeacherOrchestrator';
import OpenAI from 'openai';
import { MessageService } from '../services/messageService';


const execAsync = promisify(exec);
const router = express.Router();

// Initialize agent orchestrator
const agentOrchestrator = new EnglishTeacherOrchestrator();

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'Speech service is running',
    openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'
  });
});

// Process text through AI agent
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { text, userId, conversationId } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'No text provided'
      });
    }

    if (!userId || !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'userId and conversationId are required'
      });
    }

    // Save student's message
    const studentMessage = await MessageService.createMessage(userId, conversationId, text, 'student');

    // Process the text through AI
    const response = await agentOrchestrator.processInput(text);

    // Save tutor's response
    const tutorMessage = await MessageService.createMessage(
      userId, 
      conversationId, 
      response.text, 
      'tutor'
    );

    return res.json({
      success: true,
      response,
      messages: {
        student: studentMessage,
        tutor: tutorMessage
      }
    });

  } catch (error: any) {
    console.error('AI processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process text'
    });
  }
});

// Reset conversation context
router.post('/reset', (_req: Request, res: Response) => {
  try {
    agentOrchestrator.resetConversation();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset conversation'
    });
  }
});

// Transcribe audio endpoint
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No audio file provided' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath.replace('.webm', '.mp3');

  try {
    console.log('Received audio file:', { 
      mimetype: req.file.mimetype, 
      size: req.file.size 
    });

    // Convert WebM to MP3 using ffmpeg
    await execAsync(`"${ffmpeg}" -i "${inputPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 -b:a 192k "${outputPath}"`);

    // Send to OpenAI Whisper API
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1"
    });

    // Clean up temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return res.json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error('Transcription error:', error.response?.data || error);
    
    // Clean up temporary files in case of error
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio'
    });
  }
});

export default router; 