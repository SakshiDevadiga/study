import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyGroup } from "@shared/schema";
import { Loader2, Upload } from "lucide-react";

const uploadNoteSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  fileType: z.string().min(1, "File type is required"),
  groupId: z.string().min(1, "Please select a group"),
  fileUrl: z.string().min(1, "File URL is required"),
});

type UploadNoteFormValues = z.infer<typeof uploadNoteSchema>;

interface UploadNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: StudyGroup[];
}

export default function UploadNoteDialog({ 
  open, 
  onOpenChange,
  groups
}: UploadNoteDialogProps) {
  const { toast } = useToast();
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  
  const form = useForm<UploadNoteFormValues>({
    resolver: zodResolver(uploadNoteSchema),
    defaultValues: {
      title: "",
      fileType: "pdf",
      groupId: "",
      fileUrl: "",
    },
  });
  
  const uploadNoteMutation = useMutation({
    mutationFn: async (data: UploadNoteFormValues) => {
      // For the sake of this demo, we're using a mock file URL
      // In a real application, you would upload the file to a server first
      
      const parsedData = {
        ...data,
        groupId: parseInt(data.groupId)
      };
      
      const res = await apiRequest("POST", "/api/notes", parsedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note uploaded",
        description: "Your study note has been uploaded successfully.",
      });
      form.reset();
      setFileSelected(false);
      setFileName("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload note",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setFileSelected(true);
      
      // Set the file type based on extension
      const extension = file.name.split('.').pop()?.toLowerCase() || "";
      form.setValue("fileType", extension);
      
      // For demo purposes, we're just setting a mock URL
      // In a real app, you would upload the file to get a URL
      const mockUrl = `https://example.com/files/${file.name}`;
      form.setValue("fileUrl", mockUrl);
      
      // If title is empty, use the file name without extension
      if (!form.getValues("title")) {
        const titleFromFileName = file.name.split('.').slice(0, -1).join('.');
        form.setValue("title", titleFromFileName);
      }
    }
  };
  
  const onSubmit = (data: UploadNoteFormValues) => {
    uploadNoteMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Study Materials</DialogTitle>
          <DialogDescription>
            Share your notes with your study group.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Calculus Formulas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Group</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>File</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                      <span>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {fileSelected ? (
                    <p className="text-xs text-gray-500">Selected file: {fileName}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, PPTX up to 10MB
                    </p>
                  )}
                </div>
              </div>
              <FormField
                control={form.control}
                name="fileUrl"
                render={() => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileType"
                render={() => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={uploadNoteMutation.isPending || !fileSelected}
              >
                {uploadNoteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
