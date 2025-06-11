import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: number;
  chapterTitle: string;
  subtopicId?: number;
  subtopicTitle?: string;
}

interface ParsedQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
}

export function CSVUploadModal({ isOpen, onClose, chapterId, chapterTitle, subtopicId, subtopicTitle }: CSVUploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (questions: ParsedQuestion[]) => {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        difficulty: q.difficulty || null,
        chapterId,
        subtopicId: subtopicId || null
      }));

      console.log('Sending questions data:', formattedQuestions);

      const response = await fetch("/api/questions/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: formattedQuestions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      queryClient.invalidateQueries({ queryKey: [`/api/questions/chapter/${chapterId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });

      toast({
        title: "Success", 
        description: result.message || `Successfully uploaded ${formattedQuestions.length} questions`,
      });

      onClose();
      setParsedQuestions([]);
      setSelectedFile(null);
    },
    onSuccess: (data) => {
      console.log('Upload success:', data);
      toast({
        title: "Success!",
        description: `${parsedQuestions.length} questions uploaded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your questions.",
        variant: "destructive",
      });
    },
  });

  const parseCSV = (text: string): ParsedQuestion[] => {
    try {
      // More robust CSV parsing
      const rows = [];
      let currentRow = [];
      let inQuotes = false;
      let currentField = '';

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field.length > 0)) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
          }
        } else if (!(char === '\r' && !inQuotes)) {
          currentField += char;
        }
      }
      
      // Add the last row if it exists
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
      }

      if (rows.length < 2) throw new Error("CSV must have header and at least one data row");

      const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
      const questions: ParsedQuestion[] = [];

      // Required columns (normalized)
      const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
      const headerMap: { [key: string]: number } = {};

      // Map headers to indices
      headers.forEach((header, index) => {
        headerMap[header] = index;
      });

      // Check for required columns
      for (const col of requiredColumns) {
        if (!(col in headerMap)) {
          throw new Error(`Missing required column: ${col}`);
        }
      }

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];

        // Skip rows that don't have enough columns
        if (values.length < Math.max(...Object.values(headerMap)) + 1) continue;

        const question: ParsedQuestion = {
          question: values[headerMap['question']] || '',
          optionA: values[headerMap['optiona']] || '',
          optionB: values[headerMap['optionb']] || '',
          optionC: values[headerMap['optionc']] || '',
          optionD: values[headerMap['optiond']] || '',
          correctAnswer: values[headerMap['correctanswer']]?.toUpperCase() || '',
          explanation: headerMap['explanation'] !== undefined ? values[headerMap['explanation']] : undefined,
          difficulty: headerMap['difficulty'] !== undefined ? values[headerMap['difficulty']] : undefined,
        };

        // Basic validation
        if (question.question && question.optionA && question.optionB && 
            question.optionC && question.optionD && 
            ['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
          questions.push(question);
        } else {
          console.log(`Skipping invalid question ${i}:`, question);
        }
      }

      return questions;
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError("Please select a CSV file");
      return;
    }

    setSelectedFile(file);
    setParseError(null);

    try {
      const text = await file.text();
      const questions = parseCSV(text);
      setParsedQuestions(questions);
      toast({
        title: "CSV Parsed Successfully",
        description: `Found ${questions.length} valid questions`,
      });
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse CSV");
      setParsedQuestions([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseError(null);
    setParsedQuestions([]);
    onClose();
  };

  const handleUpload = () => {
    if (parsedQuestions.length > 0) {
      uploadMutation.mutate(parsedQuestions);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-jet border-glass-border max-w-[350px] w-[80%] rounded-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-3 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20">
              <Upload className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">Upload CSV</DialogTitle>
              <p className="text-gray-400 text-xs mt-0.5">
                {subtopicTitle ? `${chapterTitle} > ${subtopicTitle}` : chapterTitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-6 h-6 p-0 hover:bg-gray-800 rounded"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-3 pb-2">
          <div className="mb-2">
            <p className="text-xs text-gray-300 mb-1">
              Required: question, optiona, optionb, optionc, optiond, correctanswer
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              "mt-2 bg-transparent p-4 w-full flex flex-col items-center border border-dashed border-gray-600 rounded-lg transition-all duration-300 cursor-pointer",
              isDragOver && "border-green-400 bg-green-400/5",
              "hover:border-gray-500 hover:bg-gray-900/30"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={cn(
              "w-6 h-6 flex items-center justify-center rounded-full transition-transform duration-300",
              isDragOver ? "scale-110 text-green-400" : "text-green-400"
            )}>
              <Upload className="w-4 h-4" />
            </div>

            <span className="mt-2 block font-bold text-white text-center text-xs">
              {selectedFile ? selectedFile.name : "Choose CSV or drag & drop"}
            </span>

            <span className="block text-gray-400 text-xs text-center mt-1">
              <strong className="text-green-400 font-bold">Click to browse</strong>
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Status Messages */}
          {parseError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded flex items-center space-x-2">
              <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-xs">{parseError}</span>
            </div>
          )}

          {parsedQuestions.length > 0 && (
            <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-xs">
                Ready: {parsedQuestions.length} questions
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 pb-3 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 text-xs px-2 py-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={parsedQuestions.length === 0 || uploadMutation.isPending}
            className="bg-green-600 hover:bg-green-500 text-white font-medium text-xs px-3 py-1"
          >
            {uploadMutation.isPending ? "Uploading..." : `Upload ${parsedQuestions.length}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}