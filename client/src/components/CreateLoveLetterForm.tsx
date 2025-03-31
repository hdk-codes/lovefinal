import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/lib/sanity";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Send } from 'lucide-react';
import ErrorLogger from '@/lib/errorHandling';

interface CreateLoveLetterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateLoveLetterForm({ onSuccess, onCancel }: CreateLoveLetterFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [theme, setTheme] = useState('romantic');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLetterMutation = useMutation({
    mutationFn: async (letterData: {
      title: string;
      content: string;
      isPrivate: boolean;
      isAnonymous: boolean;
      theme: string;
    }) => {
      try {
        const doc = {
          _type: 'loveLetter',
          title: letterData.title,
          content: letterData.content,
          isPrivate: letterData.isPrivate,
          isAnonymous: letterData.isAnonymous,
          theme: letterData.theme,
          _createdAt: new Date().toISOString()
        };

        return await client.create(doc);
      } catch (error) {
        ErrorLogger.log(
          'Failed to create love letter',
          'high',
          'CreateLoveLetterForm',
          error instanceof Error ? error : new Error(String(error)),
          { letterData }
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      toast({
        title: "Success",
        description: "Your love letter has been sent! ❤️",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send your love letter. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!title || !content) {
        toast({
          title: "Error",
          description: "Please provide both a title and content for your letter",
          variant: "destructive"
        });
        return;
      }

      await createLetterMutation.mutateAsync({
        title,
        content,
        isPrivate,
        isAnonymous,
        theme
      });
    } catch (error) {
      ErrorLogger.log(
        'Form submission failed',
        'medium',
        'CreateLoveLetterForm',
        error instanceof Error ? error : new Error(String(error)),
        { title, isPrivate, isAnonymous, theme }
      );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-pink-200 shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-pink-50/50 space-y-1">
          <CardTitle className="text-2xl font-serif text-pink-800 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Write Your Love Letter
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your letter a meaningful title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Message</Label>
            <Textarea
              id="content"
              placeholder="Express your feelings..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] border-pink-200"
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                id="private"
              />
              <Label htmlFor="private">Private Letter</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                id="anonymous"
              />
              <Label htmlFor="anonymous">Send Anonymously</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-pink-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-pink-200"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white"
            disabled={createLetterMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            {createLetterMutation.isPending ? "Sending..." : "Send Letter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CreateLoveLetterForm;