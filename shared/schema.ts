import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").notNull(),
  totalQuestions: integer("total_questions").default(0),
  completedQuestions: integer("completed_questions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull(),
  subtopicId: integer("subtopic_id"),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of option strings
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option (0-3)
  explanation: text("explanation"),
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  currentQuestion: integer("current_question").default(0),
  score: integer("score").default(0),
  timeRemaining: integer("time_remaining"), // in seconds
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedAnswer: integer("selected_answer"), // null for unanswered
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in seconds
  markedForReview: boolean("marked_for_review").default(false),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").defaultNow(),
  type: text("type").notNull(), // quiz, practice, review
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  totalQuestionsSolved: integer("total_questions_solved").default(0),
  totalCorrectAnswers: integer("total_correct_answers").default(0),
  studyStreak: integer("study_streak").default(0),
  lastStudyDate: timestamp("last_study_date"),
  totalStudyTimeMinutes: integer("total_study_time_minutes").default(0),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").notNull(),
  chapterId: integer("chapter_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
});

// Insert schemas
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true, createdAt: true });
export const insertQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().optional().default(''),
  optionC: z.string().optional().default(''),
  optionD: z.string().optional().default(''),
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], {
    errorMap: () => ({ message: "Correct answer must be A, B, C, or D" })
  }),
  explanation: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  chapterId: z.number().positive("Chapter ID must be a positive number"),
  subtopicId: z.number().optional(),
});
export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({ id: true, createdAt: true });
export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({ id: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, date: true });
export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({ id: true });

// Types
export type Subject = typeof subjects.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;