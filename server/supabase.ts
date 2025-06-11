
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co', 
  supabaseKey || 'your-anon-key'
);

// Database tables schema
export interface SupabaseChapter {
  id: number;
  title: string;
  description: string | null;
  subject_id: number;
  total_questions: number;
  completed_questions: number;
  created_at: string;
}

export interface SupabaseSubtopic {
  id: number;
  title: string;
  description: string | null;
  chapter_id: number;
  created_at: string;
}

export interface SupabaseQuestion {
  id: number;
  chapter_id: number;
  subtopic_id: number | null;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  difficulty: string | null;
  created_at: string;
}

export interface SupabaseMessage {
  id: number;
  text: string;
  sender: string;
  created_at: string;
}

export interface SupabaseFile {
  id: number;
  name: string;
  type: string;
  size: string | null;
  path: string;
  created_at: string;
}

export interface SupabaseFolder {
  id: number;
  name: string;
  path: string;
  created_at: string;
}

export class SupabaseStorage {
  private supabaseClient = supabase;

  // Questions methods
  async getQuestions() {
    const { data, error } = await this.supabaseClient
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuestionsByChapter(chapterId: number) {
    const { data, error } = await this.supabaseClient
      .from('questions')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuestionsBySubtopic(subtopicId: number) {
    const { data, error } = await this.supabaseClient
      .from('questions')
      .select('*')
      .eq('subtopic_id', subtopicId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createQuestion(question: any) {
    // Map frontend field names to database field names
    const dbQuestion = {
      chapter_id: question.chapterId,
      subtopic_id: question.subtopicId || null,
      question: question.question,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      correct_answer: question.correctAnswer,
      explanation: question.explanation || null,
      difficulty: question.difficulty || null
    };

    const { data, error } = await this.supabaseClient
      .from('questions')
      .insert(dbQuestion)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }

  async createBulkQuestions(questions: any[]) {
    // Map frontend field names to database field names for bulk insert
    const dbQuestions = questions.map(question => ({
      chapter_id: question.chapterId,
      subtopic_id: question.subtopicId || null,
      question: question.question,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      correct_answer: question.correctAnswer,
      explanation: question.explanation || null,
      difficulty: question.difficulty || null
    }));

    const { data, error } = await this.supabaseClient
      .from('questions')
      .insert(dbQuestions)
      .select();

    if (error) {
      console.error('Supabase bulk insert error:', error);
      throw error;
    }
    return data || [];
  }

  // Chapters methods
  async getChapters() {
    const { data, error } = await this.supabaseClient
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createChapter(chapter: any) {
    const { data, error } = await this.supabaseClient
      .from('chapters')
      .insert(chapter)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateChapter(id: number, chapter: any) {
    const { data, error } = await this.supabaseClient
      .from('chapters')
      .update(chapter)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteChapter(id: number) {
    const { error } = await this.supabaseClient
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Subtopics methods
  async getSubtopicsByChapter(chapterId: number) {
    const { data, error } = await this.supabaseClient
      .from('subtopics')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createSubtopic(subtopic: any) {
    const { data, error } = await this.supabaseClient
      .from('subtopics')
      .insert(subtopic)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSubtopic(id: number) {
    const { error } = await this.supabaseClient
      .from('subtopics')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Messages methods
  async getMessages() {
    const { data, error } = await this.supabaseClient
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createMessage(message: any) {
    const { data, error } = await this.supabaseClient
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMessage(id: number) {
    const { error } = await this.supabaseClient
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Files methods
  async getFiles() {
    const { data, error } = await this.supabaseClient
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFile(file: any) {
    const { data, error } = await this.supabaseClient
      .from('files')
      .insert(file)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFile(id: number) {
    const { error } = await this.supabaseClient
      .from('files')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Folders methods
  async getFolders() {
    const { data, error } = await this.supabaseClient
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFolder(folder: any) {
    const { data, error } = await this.supabaseClient
      .from('folders')
      .insert(folder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFolder(id: number) {
    const { error } = await this.supabaseClient
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

// Export the storage instance
export const storage = new SupabaseStorage();
