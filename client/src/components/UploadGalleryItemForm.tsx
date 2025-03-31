import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface UploadGalleryItemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UploadGalleryItemForm({ onSuccess, onCancel }: UploadGalleryItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loveNote, setLoveNote] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image or video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }
    
    setMediaFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !mediaFile) {
      toast({
        title: "Error",
        description: "Please provide a title and upload a file",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For a real implementation, we would upload the file to Sanity here
      // Since we can't directly integrate with the Sanity asset upload in this demo,
      // we'll simply mock this part and use a placeholder URL for the media
      
      // In a real implementation, you would:
      // 1. Upload the file to Sanity using the client.assets.upload() method
      // 2. Get back an asset reference
      // 3. Use that reference in your document
      
      // For now, we'll just create a gallery item with the provided information
      // and use the preview URL as a placeholder
      
      const galleryItem = {
        title,
        description: description || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        date: format(new Date(), 'yyyy-MM-dd'),
        mediaUrl: previewUrl || 'https://via.placeholder.com/500',
        mediaType: mediaFile?.type.startsWith('image/') ? 'image' : 'video',
        isFavorite: false,
        loveNote: loveNote || undefined,
        views: 0,
        isPrivate: false
      };
      
      // Send to API
      const response = await apiRequest('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(galleryItem)
      });
      
      // Show success message
      toast({
        title: "Success",
        description: "Your media has been uploaded!",
        variant: "default"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/featured'] });
      
      // Reset form and call success callback
      setTitle('');
      setDescription('');
      setTags('');
      setLoveNote('');
      setMediaFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading gallery item:', error);
      toast({
        title: "Error",
        description: "Failed to upload your media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-pink-200 shadow-lg">
      <CardHeader className="bg-pink-50 rounded-t-lg">
        <CardTitle className="text-2xl font-serif text-pink-800">Share a Special Moment</CardTitle>
        <CardDescription>Upload photos or videos to capture your memories</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-pink-700">Title</Label>
            <Input
              id="title"
              placeholder="Give your moment a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-pink-700">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this special moment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-pink-700">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="love, date, anniversary (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loveNote" className="text-pink-700">Love Note (optional)</Label>
            <Textarea
              id="loveNote"
              placeholder="Add a special note to your loved one..."
              value={loveNote}
              onChange={(e) => setLoveNote(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="media" className="text-pink-700">Upload Photo/Video</Label>
            <Input
              id="media"
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          {previewUrl && (
            <div className="mt-4 border border-pink-200 rounded-md p-2">
              <p className="text-sm text-pink-700 mb-2">Preview:</p>
              {mediaFile?.type.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 rounded-md mx-auto"
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls 
                  className="max-h-64 rounded-md mx-auto"
                />
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-pink-100 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-pink-600 hover:bg-pink-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Share Memory"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default UploadGalleryItemForm;