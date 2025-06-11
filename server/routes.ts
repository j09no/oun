import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChapterSchema, insertQuestionSchema, insertQuizSessionSchema, insertQuizAnswerSchema, insertStudySessionSchema, insertScheduleEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  // Chapters
  app.get("/api/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChapters();
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/subject/:subjectId", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const chapters = await storage.getChaptersBySubject(subjectId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    try {
      const chapterData = {
        title: req.body.title,
        description: req.body.description || null,
        subjectId: req.body.subjectId
      };

      const validatedData = insertChapterSchema.parse(chapterData);
      const chapter = await storage.createChapter(validatedData);
      res.json(chapter);
    } catch (error) {
      console.error('Chapter creation error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid chapter data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create chapter" });
      }
    }
  });

  app.put("/api/chapters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapterData = insertChapterSchema.partial().parse(req.body);
      const chapter = await storage.updateChapter(id, chapterData);
      if (!chapter) {
        res.status(404).json({ error: "Chapter not found" });
        return;
      }
      res.json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid chapter data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update chapter" });
      }
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChapter(id);
      if (!deleted) {
        res.status(404).json({ error: "Chapter not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chapter" });
    }
  });

  // Questions
  app.get("/api/questions/chapter/:chapterId", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const questions = await storage.getQuestionsByChapter(chapterId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/subtopic/:subtopicId", async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.subtopicId);
      const questions = await storage.getQuestionsBySubtopic(subtopicId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subtopic questions" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid question data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create question" });
      }
    }
  });

  app.post("/api/questions/import-csv", async (req, res) => {
    try {
      console.log('Received CSV import request:', req.body);

      if (!req.body.questions || !Array.isArray(req.body.questions)) {
        res.status(400).json({ error: "Invalid request format. Expected 'questions' array." });
        return;
      }

      // Process questions directly with the local storage format
      const validatedQuestions = [];
      for (let i = 0; i < req.body.questions.length; i++) {
        const q = req.body.questions[i];
        try {
          // Map the question data to the expected format
          const questionData = {
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            chapterId: q.chapterId,
            subtopicId: q.subtopicId
          };
          validatedQuestions.push(questionData);
        } catch (validationError) {
          console.log(`Question ${i + 1} validation failed:`, validationError);
          // Skip invalid questions but continue processing
        }
      }

      if (validatedQuestions.length === 0) {
        res.status(400).json({ error: "No valid questions found in the data" });
        return;
      }

      const questions = await storage.createBulkQuestions(validatedQuestions);
      res.json({ message: `Successfully imported ${questions.length} questions`, questions });
    } catch (error) {
      console.error('CSV import error:', error);
      res.status(500).json({ error: "Failed to import questions", message: error.message });
    }
  });

  // Subtopics
  app.get("/api/subtopics/chapter/:chapterId", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const subtopics = await storage.getSubtopicsByChapter(chapterId);
      res.json(subtopics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subtopics" });
    }
  });

  app.post("/api/subtopics", async (req, res) => {
    try {
      const subtopic = await storage.createSubtopic(req.body);
      res.json(subtopic);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subtopic" });
    }
  });

  app.delete("/api/subtopics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubtopic(id);
      if (!deleted) {
        res.status(404).json({ error: "Subtopic not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subtopic" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const file = await storage.createFile(req.body);
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      if (!deleted) {
        res.status(404).json({ error: "File not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Folders
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const folder = await storage.createFolder(req.body);
      res.json(folder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFolder(id);
      if (!deleted) {
        res.status(404).json({ error: "Folder not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // Quiz Sessions
  app.post("/api/quiz-sessions", async (req, res) => {
    try {
      const sessionData = insertQuizSessionSchema.parse(req.body);
      const session = await storage.createQuizSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create quiz session" });
      }
    }
  });

  app.get("/api/quiz/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.getQuizSession(sessionId);
      if (!session) {
        res.status(404).json({ error: "Quiz session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz session" });
    }
  });

  app.put("/api/quiz/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const sessionData = insertQuizSessionSchema.partial().parse(req.body);
      const session = await storage.updateQuizSession(sessionId, sessionData);
      if (!session) {
        res.status(404).json({ error: "Quiz session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update quiz session" });
      }
    }
  });

  app.post("/api/quiz/:sessionId/answer", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const answerData = insertQuizAnswerSchema.parse({ ...req.body, sessionId });
      const answer = await storage.saveQuizAnswer(answerData);
      res.json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid answer data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to save answer" });
      }
    }
  });

  app.get("/api/quiz/:sessionId/answers", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const answers = await storage.getQuizAnswers(sessionId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz answers" });
    }
  });

  // Study Sessions
  app.get("/api/study-sessions", async (req, res) => {
    try {
      const sessions = await storage.getStudySessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create study session" });
      }
    }
  });

  // User Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.put("/api/stats", async (req, res) => {
    try {
      const statsData = req.body;
      const stats = await storage.updateUserStats(statsData);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user stats" });
    }
  });

  // Schedule Events
  app.get("/api/schedule", async (req, res) => {
    try {
      const events = await storage.getScheduleEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule events" });
    }
  });

  app.get("/api/schedule/date/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const events = await storage.getScheduleEventsByDate(date);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule events" });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const eventData = insertScheduleEventSchema.parse(req.body);
      const event = await storage.createScheduleEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create schedule event" });
      }
    }
  });

  app.put("/api/schedule/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertScheduleEventSchema.partial().parse(req.body);
      const event = await storage.updateScheduleEvent(id, eventData);
      if (!event) {
        res.status(404).json({ error: "Schedule event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update schedule event" });
      }
    }
  });

  app.delete("/api/schedule/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteScheduleEvent(id);
      if (!deleted) {
        res.status(404).json({ error: "Schedule event not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule event" });
    }
  });

  // Files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const file = await storage.createFile(req.body);
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  // Folders
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const folder = await storage.createFolder(req.body);
      res.json(folder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  app.post("/api/questions/bulk", async (req, res) => {
    try {
      const { questions } = req.body;
      const results = [];

      for (const question of questions) {
        try {
          const result = await storage.createQuestion(question);
          results.push(result);
        } catch (error) {
          console.error('Error creating question:', error);
        }
      }
      res.json({ message: `${results.length} questions created successfully`, questions: results });
    } catch (error) {
      res.status(500).json({ error: "Failed to create bulk questions", message: error.message });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFolder(id);
      if (!deleted) {
        res.status(404).json({ error: "Folder not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });
  // CSV Upload endpoint
  app.post('/api/upload-csv', async (req, res) => {
    try {
      const { questions } = req.body;
      console.log('Received questions for upload:', questions);

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Invalid questions data' });
      }

      // Transform questions to match the expected format
      const transformedQuestions = questions.map(q => ({
        chapterId: q.chapterId,
        subtopicId: q.subtopicId || null,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        difficulty: q.difficulty || null
      }));

      console.log('Transformed questions:', transformedQuestions);

      // Save questions to database using bulk insert
      const savedQuestions = await storage.createBulkQuestions(transformedQuestions);
      console.log('Saved questions:', savedQuestions);

      res.json({ 
        success: true, 
        message: `Successfully uploaded ${savedQuestions.length} questions`,
        count: savedQuestions.length 
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      res.status(500).json({ 
        error: 'Failed to upload questions', 
        details: error.message 
      });
    }
  });

  // Save quiz result
  app.post("/api/quiz-results", (req, res) => {
    try {
      const { chapterId, subtopicId, score, totalQuestions, correct, incorrect, unanswered, quizType, chapterTitle, subtopicTitle, subjectName } = req.body;

      const existingStats = localStorage.getItem('quizStats');
      const stats = existingStats ? JSON.parse(existingStats) : [];

      const newResult = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        subject: subjectName || 'Unknown',
        chapter: chapterTitle || 'Unknown Chapter',
        subtopic: subtopicTitle || null,
        score: correct,
        totalQuestions,
        accuracy: Math.round((correct / totalQuestions) * 100),
        quizType,
        timestamp: new Date().toISOString()
      };

      stats.unshift(newResult); // Add to beginning of array
      localStorage.setItem('quizStats', JSON.stringify(stats));

      res.json({ message: "Quiz result saved successfully", result: newResult });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      res.status(500).json({ error: "Failed to save quiz result" });
    }
  });

  // Get quiz statistics
  app.get("/api/quiz-stats", (req, res) => {
    const stats = localStorage.getItem('quizStats');
    if (stats) {
      res.json(JSON.parse(stats));
    } else {
      res.json([]);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}