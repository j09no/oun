
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Upload, FileText, Image, Download, Search, MoreVertical, Folder, ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileItem {
  id: number;
  name: string;
  type: "folder" | "pdf" | "image" | "document";
  size?: string;
  modified: string;
  path: string;
}

export default function Storage() {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [files, setFiles] = useState<FileItem[]>([]);

  // Load files and folders from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [filesResponse, foldersResponse] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/folders')
        ]);

        const filesData = await filesResponse.json();
        const foldersData = await foldersResponse.json();

        const allItems: FileItem[] = [
          ...foldersData.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            type: "folder" as const,
            modified: new Date(folder.createdAt).toLocaleDateString(),
            path: folder.path
          })),
          ...filesData.map((file: any) => ({
            id: file.id,
            name: file.name,
            type: file.type as FileItem['type'],
            size: file.size,
            modified: new Date(file.createdAt).toLocaleDateString(),
            path: file.path
          }))
        ];

        setFiles(allItems);
      } catch (error) {
        console.error('Error loading files and folders:', error);
      }
    };

    loadData();
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder": return <Folder className="w-8 h-8 text-blue-400" />;
      case "pdf": return <FileText className="w-8 h-8 text-red-400" />;
      case "image": return <Image className="w-8 h-8 text-green-400" />;
      case "document": return <FileText className="w-8 h-8 text-blue-400" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newFolderName,
            path: `${currentPath}${newFolderName.toLowerCase().replace(/\s+/g, '-')}`
          }),
        });

        const newFolder = await response.json();
        const folderItem: FileItem = {
          id: newFolder.id,
          name: newFolder.name,
          type: "folder",
          modified: new Date(newFolder.created_at).toLocaleDateString(),
          path: newFolder.path
        };

        setFiles(prev => [...prev, folderItem]);
        setNewFolderName("");
        setIsCreateFolderOpen(false);
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileData = {
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'document',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          path: `${currentPath}${file.name}`
        };

        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData),
        });

        const newFile = await response.json();
        const fileItem: FileItem = {
          id: newFile.id,
          name: newFile.name,
          type: newFile.type as FileItem['type'],
          size: newFile.size,
          modified: new Date(newFile.createdAt).toLocaleDateString(),
          path: newFile.path
        };

        setFiles(prev => [...prev, fileItem]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDownload = (file: FileItem) => {
    // Create a download link for the file
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (item: FileItem) => {
    try {
      const endpoint = item.type === 'folder' ? '/api/folders' : '/api/files';
      const response = await fetch(`${endpoint}/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== item.id));
      } else {
        console.error('Error deleting item:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleFolderOpen = (folder: FileItem) => {
    if (folder.type === 'folder') {
      setCurrentPath(folder.path + '/');
    }
  };

  const handleBackNavigation = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/') + (pathParts.length > 0 ? '/' : ''));
    }
  };

  const filteredFiles = files.filter(file => 
    file.path.startsWith(currentPath) && 
    file.path.replace(currentPath, '').split('/').length === 1 &&
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pathBreadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <section className="px-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Storage</h2>
          <p className="text-gray-400">Organize your study materials</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18181b] border-gray-800">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-[#27272a] border-gray-700"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleCreateFolder} className="flex-1">
                    Create
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateFolderOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </label>
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center space-x-2 mb-4">
        {currentPath !== '/' && (
          <Button variant="ghost" size="sm" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <span>Home</span>
          {pathBreadcrumbs.map((part, index) => (
            <span key={index}>
              <span className="mx-1">/</span>
              <span>{part}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#27272a] border-gray-700"
        />
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={`${file.type}-${file.id}`} className="bg-[#27272a]/50 border-gray-800 hover:bg-[#27272a]/70 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="flex-1" 
                  onClick={() => file.type === 'folder' ? handleFolderOpen(file) : null}
                >
                  {getFileIcon(file.type)}
                  <h3 className="font-medium mt-2 mb-1 truncate">{file.name}</h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    {file.size && <p>{file.size}</p>}
                    <p>Modified {file.modified}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {file.type !== 'folder' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No files or folders found</div>
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
