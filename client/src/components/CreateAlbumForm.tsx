import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Switch } from "@/components/ui/switch";

interface CreateAlbumFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAlbumForm({ onSuccess, onCancel }: CreateAlbumFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Error",
        description: "Please provide a title for your album",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const album = {
        title,
        description: description || undefined,
        coverImage: coverImageUrl || undefined,
        isPrivate
      };
      
      // Send to API
      const response = await apiRequest('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(album)
      });
      
      // Show success message
      toast({
        title: "Success",
        description: "Your album has been created!",
        variant: "default"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/albums'] });
      
      // Reset form and call success callback
      setTitle('');
      setDescription('');
      setCoverImageUrl('');
      setIsPrivate(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating album:', error);
      toast({
        title: "Error",
        description: "Failed to create your album. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-pink-200 shadow-lg">
      <CardHeader className="bg-pink-50 rounded-t-lg">
        <CardTitle className="text-2xl font-serif text-pink-800">Create a Memory Album</CardTitle>
        <CardDescription>Organize your cherished memories into a beautiful collection</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-pink-700">Album Title</Label>
            <Input
              id="title"
              placeholder="Give your album a memorable title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-pink-700">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this album means to you..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-pink-700">Cover Image URL (optional)</Label>
            <Input
              id="coverImage"
              placeholder="https://example.com/your-image.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              For the demo, enter any image URL. In a complete implementation, we would have an image upload feature.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="isPrivate" className="text-pink-700">Make this album private</Label>
          </div>
          
          {coverImageUrl && (
            <div className="mt-4 border border-pink-200 rounded-md p-2">
              <p className="text-sm text-pink-700 mb-2">Cover Image Preview:</p>
              <img 
                src={coverImageUrl} 
                alt="Album Cover Preview" 
                className="max-h-64 rounded-md mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                }}
              />
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
            {isSubmitting ? "Creating..." : "Create Album"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CreateAlbumForm;