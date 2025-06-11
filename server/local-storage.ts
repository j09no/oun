import * as fs from 'fs';
import * as path from 'path';

// Local data interfaces
interface Subject {
  id: number;
  name: string;
  color: string;
}

interface Chapter {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  totalQuestions: number;
  completedQuestions: number;
  createdAt: Date;
}

interface Question {
  id: number;
  chapterId: number;
  subtopicId?: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty?: string;
  createdAt: Date;
}

interface Subtopic {
  id: number;
  title: string;
  description?: string;
  chapterId: number;
  createdAt: Date;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  createdAt: Date;
}

interface FileRecord {
  id: number;
  name: string;
  type: string;
  size?: string;
  path: string;
  createdAt: Date;
}

interface Folder {
  id: number;
  name: string;
  path: string;
  createdAt: Date;
}

interface QuizSession {
  id: number;
  chapterId: number;
  totalQuestions: number;
  currentQuestion: number;
  score: number;
  timeRemaining?: number;
  isCompleted: boolean;
  createdAt: Date;
}

interface QuizAnswer {
  id: number;
  sessionId: number;
  questionId: number;
  selectedAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
  markedForReview?: boolean;
}

interface StudySession {
  id: number;
  chapterId: number;
  duration: number;
  date: Date;
  type: string;
}

interface UserStats {
  id: number;
  totalQuestionsSolved: number;
  totalCorrectAnswers: number;
  studyStreak: number;
  lastStudyDate?: Date;
  totalStudyTimeMinutes: number;
}

interface ScheduleEvent {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  chapterId?: number;
  startTime: Date;
  endTime: Date;
  isCompleted?: boolean;
}

export class LocalStorage {
  private subjects: Map<number, Subject> = new Map();
  private chapters: Map<number, Chapter> = new Map();
  private questions: Map<number, Question> = new Map();
  private subtopics: Map<number, Subtopic> = new Map();
  private messages: Map<number, Message> = new Map();
  private files: Map<number, FileRecord> = new Map();
  private folders: Map<number, Folder> = new Map();
  private quizSessions: Map<number, QuizSession> = new Map();
  private quizAnswers: Map<number, QuizAnswer> = new Map();
  private studySessions: Map<number, StudySession> = new Map();
  private userStatsData: UserStats = {
    id: 1,
    totalQuestionsSolved: 1247,
    totalCorrectAnswers: 1085,
    studyStreak: 12,
    lastStudyDate: new Date(),
    totalStudyTimeMinutes: 1260,
  };
  private scheduleEvents: Map<number, ScheduleEvent> = new Map();

  // ID counters
  private subjectIdCounter = 1;
  private chapterIdCounter = 1;
  private questionIdCounter = 1;
  private subtopicIdCounter = 1;
  private messageIdCounter = 1;
  private fileIdCounter = 1;
  private folderIdCounter = 1;
  private sessionIdCounter = 1;
  private answerIdCounter = 1;
  private studySessionIdCounter = 1;
  private eventIdCounter = 1;

  constructor() {
    this.loadPersistedData();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Only add default subjects if none exist
    if (this.subjects.size === 0) {
      this.subjects.set(1, { id: 1, name: "Physics", color: "blue" });
      this.subjects.set(2, { id: 2, name: "Chemistry", color: "green" });
      this.subjects.set(3, { id: 3, name: "Biology", color: "purple" });
      this.subjectIdCounter = 4;
    }

    // Only add sample chapters if none exist
    if (this.chapters.size === 0) {
      const sampleChapters: Chapter[] = [
        { id: 1, title: "Mechanics", description: "Laws of motion and forces", subjectId: 1, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
        { id: 2, title: "Thermodynamics", description: "Heat and energy transfer", subjectId: 1, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
        { id: 3, title: "Atomic Structure", description: "Structure of atoms and molecules", subjectId: 2, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
        { id: 4, title: "Chemical Bonding", description: "Types of chemical bonds", subjectId: 2, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
        { id: 5, title: "Cell Biology", description: "Structure and function of cells", subjectId: 3, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
        { id: 6, title: "Genetics", description: "Heredity and genetic variation", subjectId: 3, totalQuestions: 0, completedQuestions: 0, createdAt: new Date() },
      ];

      sampleChapters.forEach(chapter => {
        this.chapters.set(chapter.id, chapter);
      });
      this.chapterIdCounter = 7;
    }

    this.persistData();
  }

  private loadPersistedData() {
    try {
      const dataPath = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      // Load all data types
      this.loadDataType('subjects', this.subjects, (data: Subject) => {
        if (data.id >= this.subjectIdCounter) this.subjectIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('chapters', this.chapters, (data: Chapter) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.chapterIdCounter) this.chapterIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('questions', this.questions, (data: Question) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.questionIdCounter) this.questionIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('subtopics', this.subtopics, (data: Subtopic) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.subtopicIdCounter) this.subtopicIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('messages', this.messages, (data: Message) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.messageIdCounter) this.messageIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('files', this.files, (data: FileRecord) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.fileIdCounter) this.fileIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('folders', this.folders, (data: Folder) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.folderIdCounter) this.folderIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('quizSessions', this.quizSessions, (data: QuizSession) => {
        data.createdAt = new Date(data.createdAt);
        if (data.id >= this.sessionIdCounter) this.sessionIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('quizAnswers', this.quizAnswers, (data: QuizAnswer) => {
        if (data.id >= this.answerIdCounter) this.answerIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('studySessions', this.studySessions, (data: StudySession) => {
        data.date = new Date(data.date);
        if (data.id >= this.studySessionIdCounter) this.studySessionIdCounter = data.id + 1;
        return data;
      });

      this.loadDataType('scheduleEvents', this.scheduleEvents, (data: ScheduleEvent) => {
        data.startTime = new Date(data.startTime);
        data.endTime = new Date(data.endTime);
        if (data.id >= this.eventIdCounter) this.eventIdCounter = data.id + 1;
        return data;
      });

    } catch (error) {
      console.log('No persisted data found or error loading, using defaults');
    }
  }

  private loadDataType<T>(filename: string, map: Map<number, T>, processor: (data: any) => T) {
    try {
      const dataPath = path.join(process.cwd(), 'data');
      const filePath = path.join(dataPath, `${filename}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.forEach((item: any) => {
          const processedItem = processor(item);
          map.set(item.id, processedItem);
        });
      }
    } catch (error) {
      console.log(`Error loading ${filename}:`, error);
    }
  }

  private persistData() {
    try {
      const dataPath = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      // Save all data types
      this.saveDataType('subjects', this.subjects);
      this.saveDataType('chapters', this.chapters);
      this.saveDataType('questions', this.questions);
      this.saveDataType('subtopics', this.subtopics);
      this.saveDataType('messages', this.messages);
      this.saveDataType('files', this.files);
      this.saveDataType('folders', this.folders);
      this.saveDataType('quizSessions', this.quizSessions);
      this.saveDataType('quizAnswers', this.quizAnswers);
      this.saveDataType('studySessions', this.studySessions);
      this.saveDataType('scheduleEvents', this.scheduleEvents);
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private saveDataType<T>(filename: string, map: Map<number, T>) {
    try {
      const dataPath = path.join(process.cwd(), 'data');
      const filePath = path.join(dataPath, `${filename}.json`);
      const data = Array.from(map.values());
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
    }
  }

  // API Methods

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const id = this.subjectIdCounter++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    this.persistData();
    return newSubject;
  }

  // Chapters
  async getChapters(): Promise<Chapter[]> {
    return Array.from(this.chapters.values());
  }

  async getChaptersBySubject(subjectId: number): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).filter(chapter => chapter.subjectId === subjectId);
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(chapter: Omit<Chapter, 'id' | 'createdAt' | 'totalQuestions' | 'completedQuestions'>): Promise<Chapter> {
    const id = this.chapterIdCounter++;
    const newChapter: Chapter = { 
      ...chapter, 
      id, 
      createdAt: new Date(),
      totalQuestions: 0,
      completedQuestions: 0
    };
    this.chapters.set(id, newChapter);
    this.persistData();
    return newChapter;
  }

  async updateChapter(id: number, chapter: Partial<Chapter>): Promise<Chapter | undefined> {
    const existing = this.chapters.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...chapter };
    this.chapters.set(id, updated);
    this.persistData();
    return updated;
  }

  async deleteChapter(id: number): Promise<boolean> {
    const deleted = this.chapters.delete(id);
    if (deleted) {
      // Also delete related questions and subtopics
      Array.from(this.questions.values())
        .filter(q => q.chapterId === id)
        .forEach(q => this.questions.delete(q.id));
      
      Array.from(this.subtopics.values())
        .filter(s => s.chapterId === id)
        .forEach(s => this.subtopics.delete(s.id));
      
      this.persistData();
    }
    return deleted;
  }

  // Questions
  async getQuestionsByChapter(chapterId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(question => question.chapterId === chapterId);
  }

  async getQuestionsBySubtopic(subtopicId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(question => question.subtopicId === subtopicId);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(questionData: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
    difficulty?: string;
    chapterId: number;
    subtopicId?: number;
  }): Promise<Question> {
    const id = this.questionIdCounter++;
    const newQuestion: Question = { 
      ...questionData, 
      id, 
      createdAt: new Date()
    };
    this.questions.set(id, newQuestion);
    
    // Update chapter question count
    const chapter = this.chapters.get(questionData.chapterId);
    if (chapter) {
      chapter.totalQuestions++;
      this.chapters.set(chapter.id, chapter);
    }
    
    this.persistData();
    return newQuestion;
  }

  async createBulkQuestions(questions: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
    difficulty?: string;
    chapterId: number;
    subtopicId?: number;
  }>): Promise<Question[]> {
    const createdQuestions: Question[] = [];
    
    for (const questionData of questions) {
      const id = this.questionIdCounter++;
      const newQuestion: Question = {
        ...questionData,
        id,
        createdAt: new Date()
      };
      this.questions.set(id, newQuestion);
      createdQuestions.push(newQuestion);
      
      // Update chapter question count
      const chapter = this.chapters.get(questionData.chapterId);
      if (chapter) {
        chapter.totalQuestions++;
        this.chapters.set(chapter.id, chapter);
      }
    }
    
    this.persistData();
    return createdQuestions;
  }

  // Subtopics
  async getSubtopicsByChapter(chapterId: number): Promise<Subtopic[]> {
    return Array.from(this.subtopics.values()).filter(subtopic => subtopic.chapterId === chapterId);
  }

  async createSubtopic(subtopic: Omit<Subtopic, 'id' | 'createdAt'>): Promise<Subtopic> {
    const id = this.subtopicIdCounter++;
    const newSubtopic: Subtopic = {
      ...subtopic,
      id,
      createdAt: new Date()
    };
    this.subtopics.set(id, newSubtopic);
    this.persistData();
    return newSubtopic;
  }

  async deleteSubtopic(id: number): Promise<boolean> {
    const deleted = this.subtopics.delete(id);
    if (deleted) {
      // Also delete related questions
      Array.from(this.questions.values())
        .filter(q => q.subtopicId === id)
        .forEach(q => this.questions.delete(q.id));
      this.persistData();
    }
    return deleted;
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    this.persistData();
    return newMessage;
  }

  // Files
  async getFiles(): Promise<FileRecord[]> {
    return Array.from(this.files.values());
  }

  async createFile(file: Omit<FileRecord, 'id' | 'createdAt'>): Promise<FileRecord> {
    const id = this.fileIdCounter++;
    const newFile: FileRecord = {
      ...file,
      id,
      createdAt: new Date()
    };
    this.files.set(id, newFile);
    this.persistData();
    return newFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const deleted = this.files.delete(id);
    if (deleted) this.persistData();
    return deleted;
  }

  // Folders
  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const id = this.folderIdCounter++;
    const newFolder: Folder = {
      ...folder,
      id,
      createdAt: new Date()
    };
    this.folders.set(id, newFolder);
    this.persistData();
    return newFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    const deleted = this.folders.delete(id);
    if (deleted) this.persistData();
    return deleted;
  }

  // Quiz Sessions
  async createQuizSession(session: Omit<QuizSession, 'id' | 'createdAt'>): Promise<QuizSession> {
    const id = this.sessionIdCounter++;
    const newSession: QuizSession = { 
      ...session, 
      id, 
      createdAt: new Date()
    };
    this.quizSessions.set(id, newSession);
    this.persistData();
    return newSession;
  }

  async getQuizSession(id: number): Promise<QuizSession | undefined> {
    return this.quizSessions.get(id);
  }

  async updateQuizSession(id: number, session: Partial<QuizSession>): Promise<QuizSession | undefined> {
    const existing = this.quizSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...session };
    this.quizSessions.set(id, updated);
    this.persistData();
    return updated;
  }

  async getAllQuizSessions(): Promise<QuizSession[]> {
    return Array.from(this.quizSessions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Quiz Answers
  async createQuizAnswer(answer: Omit<QuizAnswer, 'id'>): Promise<QuizAnswer> {
    const id = this.answerIdCounter++;
    const newAnswer: QuizAnswer = { ...answer, id };
    this.quizAnswers.set(id, newAnswer);
    this.persistData();
    return newAnswer;
  }

  async getQuizAnswersBySession(sessionId: number): Promise<QuizAnswer[]> {
    return Array.from(this.quizAnswers.values()).filter(answer => answer.sessionId === sessionId);
  }

  // Study Sessions
  async createStudySession(session: Omit<StudySession, 'id' | 'date'>): Promise<StudySession> {
    const id = this.studySessionIdCounter++;
    const newSession: StudySession = { 
      ...session, 
      id, 
      date: new Date()
    };
    this.studySessions.set(id, newSession);
    this.persistData();
    return newSession;
  }

  async getStudySessionsByChapter(chapterId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => session.chapterId === chapterId);
  }

  // User Stats
  async getUserStats(): Promise<UserStats> {
    return this.userStatsData;
  }

  async updateUserStats(stats: Partial<UserStats>): Promise<UserStats> {
    this.userStatsData = { ...this.userStatsData, ...stats };
    this.persistData();
    return this.userStatsData;
  }

  // Schedule Events
  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    return Array.from(this.scheduleEvents.values());
  }

  async createScheduleEvent(event: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent> {
    const id = this.eventIdCounter++;
    const newEvent: ScheduleEvent = { ...event, id };
    this.scheduleEvents.set(id, newEvent);
    this.persistData();
    return newEvent;
  }

  async updateScheduleEvent(id: number, event: Partial<ScheduleEvent>): Promise<ScheduleEvent | undefined> {
    const existing = this.scheduleEvents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...event };
    this.scheduleEvents.set(id, updated);
    this.persistData();
    return updated;
  }

  async deleteScheduleEvent(id: number): Promise<boolean> {
    const deleted = this.scheduleEvents.delete(id);
    if (deleted) this.persistData();
    return deleted;
  }
}

export const storage = new LocalStorage();