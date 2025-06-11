
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Book, Plus, ArrowLeft, Play, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { CSVUploadModal } from "@/components/csv-upload-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const subtopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

interface Subtopic {
  id: number;
  title: string;
  description?: string;
  chapter_id: number;
  created_at: string;
}

interface ChapterDetailsProps {
  chapterId: string;
}

export default function ChapterDetails({ chapterId }: ChapterDetailsProps) {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvUploadModal, setCsvUploadModal] = useState<{ 
    isOpen: boolean; 
    chapterId: number; 
    subtopicId?: number;
    subtopicTitle?: string;
  }>({
    isOpen: false,
    chapterId: 0,
  });
  const { toast } = useToast();

  // Get chapter data
  const { data: chapters } = useQuery({
    queryKey: ["/api/chapters"],
  });

  // Get subtopics data
  const { data: subtopics, refetch: refetchSubtopics } = useQuery<Subtopic[]>({
    queryKey: [`/api/subtopics/chapter/${chapterId}`],
    enabled: !!chapterId,
  });

  const chapter = chapters?.find(c => c.id === parseInt(chapterId));

  const form = useForm<z.infer<typeof subtopicSchema>>({
    resolver: zodResolver(subtopicSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createSubtopicMutation = useMutation({
    mutationFn: async (data: z.infer<typeof subtopicSchema>) => {
      const response = await apiRequest("POST", "/api/subtopics", {
        title: data.title,
        description: data.description,
        chapterId: parseInt(chapterId),
      });
      return response.json();
    },
    onSuccess: () => {
      refetchSubtopics();
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Subtopic added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSubtopicMutation = useMutation({
    mutationFn: async (subtopicId: number) => {
      const response = await apiRequest("DELETE", `/api/subtopics/${subtopicId}`);
      return response.json();
    },
    onSuccess: () => {
      refetchSubtopics();
      toast({
        title: "Success",
        description: "Subtopic deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSubtopic = (data: z.infer<typeof subtopicSchema>) => {
    createSubtopicMutation.mutate(data);
  };

  const handleDeleteSubtopic = (subtopicId: number) => {
    if (confirm("Are you sure you want to delete this subtopic?")) {
      deleteSubtopicMutation.mutate(subtopicId);
    }
  };

  const handleDeleteChapter = () => {
    if (confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      });
      setLocation("/chapters");
    }
  };

  const handlePlaySubtopic = async (subtopicId: number, subtopicTitle: string) => {
    try {
      const response = await apiRequest("GET", `/api/questions/subtopic/${subtopicId}`);
      const questions = await response.json();
      
      if (questions && questions.length > 0) {
        // Store current subtopic for quiz
        localStorage.setItem('currentSubtopicQuiz', JSON.stringify({
          subtopicId,
          subtopicTitle,
          chapterId: parseInt(chapterId),
          questions
        }));
        setLocation("/quiz");
      } else {
        toast({
          title: "No Questions Available",
          description: `Please add questions to ${subtopicTitle} first using the CSV upload.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions for this subtopic",
        variant: "destructive",
      });
    }
  };

  if (!chapter) {
    return (
      <section className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chapter Not Found</h2>
          <Button onClick={() => setLocation("/chapters")}>
            Back to Chapters
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex justify-center mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Subtopic
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-jet-light border-glass-border">
            <DialogHeader>
              <DialogTitle>Add New Subtopic</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddSubtopic)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Subtopic title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Subtopic description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createSubtopicMutation.isPending}>
                  {createSubtopicMutation.isPending ? "Adding..." : "Add Subtopic"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subtopics */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Subtopics ({subtopics?.length || 0})</h3>

        {!subtopics || subtopics.length === 0 ? (
          <Card className="glass-morphism">
            <CardContent className="p-6 text-center">
              <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No subtopics found</p>
              <p className="text-sm text-gray-500 mt-1">Add your first subtopic to get started</p>
            </CardContent>
          </Card>
        ) : (
          subtopics.map((subtopic) => (
            <Card key={subtopic.id} className="glass-morphism hover:bg-opacity-20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{subtopic.title}</h4>
                    {subtopic.description && (
                      <p className="text-gray-400 text-sm mb-3">{subtopic.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm mb-3">
                      <span className="flex items-center space-x-1">
                        <Book className="w-4 h-4 text-blue-400" />
                        <span>Questions Available</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(subtopic.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlaySubtopic(subtopic.id, subtopic.title)}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCsvUploadModal({
                        isOpen: true,
                        chapterId: parseInt(chapterId),
                        subtopicId: subtopic.id,
                        subtopicTitle: subtopic.title
                      })}
                      className="bg-green-600 hover:bg-green-500 text-white"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSubtopic(subtopic.id)}
                      className="bg-red-600 hover:bg-red-500"
                      disabled={deleteSubtopicMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={csvUploadModal.isOpen}
        onClose={() => setCsvUploadModal({ isOpen: false, chapterId: 0 })}
        chapterId={csvUploadModal.chapterId}
        chapterTitle={chapter.title}
        subtopicId={csvUploadModal.subtopicId}
        subtopicTitle={csvUploadModal.subtopicTitle}
      />
    </section>
  );
}
