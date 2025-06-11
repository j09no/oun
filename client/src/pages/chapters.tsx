import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Book, Clock, Edit, Trash2, Play, RotateCcw, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChapterSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CSVUploadModal } from "@/components/csv-upload-modal";
import type { Chapter, Subject } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export default function Chapters() {
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState("1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvUploadModal, setCsvUploadModal] = useState<{ isOpen: boolean; chapterId: number; chapterTitle: string }>({
    isOpen: false,
    chapterId: 0,
    chapterTitle: ""
  });
  const { toast } = useToast();

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters"],
  });

  const createChapterMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const chapterData = {
        ...data,
        subjectId: parseInt(selectedSubject),
        totalQuestions: 0,
        completedQuestions: 0
      };
      const response = await apiRequest("POST", "/api/chapters", chapterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Chapter created successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: number) => {
      const response = await apiRequest("DELETE", `/api/chapters/${chapterId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createChapterMutation.mutate(data);
  };

  const filteredChapters = chapters?.filter(
    chapter => chapter.subjectId === parseInt(selectedSubject)
  ) || [];

  const getSubjectColor = (subjectId: number) => {
    const subject = subjects?.find(s => s.id === subjectId);
    return subject?.color || "blue";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Chapters</h2>
            <p className="text-gray-400">Manage your study materials</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-morphism">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex space-x-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Chapters</h2>
          <p className="text-gray-400">Manage your study materials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-jet-light border-glass-border">
            <DialogHeader>
              <DialogTitle>
                Add New Chapter to {subjects?.find(s => s.id === parseInt(selectedSubject))?.name}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Chapter title" {...field} />
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
                        <Textarea placeholder="Chapter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createChapterMutation.isPending}>
                  {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Tabs */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-6">
        <TabsList className="glass-morphism w-full">
          {subjects?.map((subject) => (
            <TabsTrigger 
              key={subject.id} 
              value={subject.id.toString()}
              className="flex-1"
            >
              {subject.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Chapters Grid */}
      <div className="grid gap-4">
        {filteredChapters.length === 0 ? (
          <Card className="glass-morphism">
            <CardContent className="p-6 text-center">
              <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No chapters found for this subject</p>
              <p className="text-sm text-gray-500 mt-1">Add your first chapter to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredChapters.map((chapter) => {
            const progressPercentage = (chapter.totalQuestions || 0) > 0 
              ? Math.round(((chapter.completedQuestions || 0) / (chapter.totalQuestions || 1)) * 100)
              : 0;

            return (
              <Card 
                key={chapter.id} 
                className="glass-morphism hover:bg-opacity-20 transition-all duration-300 cursor-pointer"
                onClick={() => setLocation(`/chapter/${chapter.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{chapter.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Book className="w-4 h-4 text-blue-400" />
                          <span>{chapter.totalQuestions} Questions</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span>{progressPercentage}% Complete</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation("/quiz");
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCsvUploadModal({
                          isOpen: true,
                          chapterId: chapter.id,
                          chapterTitle: chapter.title
                        });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this chapter?")) {
                          deleteChapterMutation.mutate(chapter.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-500"
                      disabled={deleteChapterMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={csvUploadModal.isOpen}
        onClose={() => setCsvUploadModal({ isOpen: false, chapterId: 0, chapterTitle: "" })}
        chapterId={csvUploadModal.chapterId}
        chapterTitle={csvUploadModal.chapterTitle}
      />
    </section>
  );
}