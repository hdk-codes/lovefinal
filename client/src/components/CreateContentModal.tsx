import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import CreateLoveLetterForm from './CreateLoveLetterForm';
import UploadGalleryItemForm from './UploadGalleryItemForm';
import RecordAudioMessageForm from './RecordAudioMessageForm';
import CreateAlbumForm from './CreateAlbumForm';
import ErrorLogger from '@/lib/errorHandling';

export type ContentType = 'loveLetter' | 'galleryItem' | 'audioMessage' | 'album';

interface CreateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  onSuccess?: () => void;
}

export function CreateContentModal({ 
  open, 
  onOpenChange, 
  contentType, 
  onSuccess 
}: CreateContentModalProps) {
  // Move useState hook inside component
  const [isModalOpen, setIsModalOpen] = useState(open);
  
  const getTitle = () => {
    switch (contentType) {
      case 'loveLetter':
        return 'Write a Love Letter';
      case 'galleryItem':
        return 'Share a Photo or Video';
      case 'audioMessage':
        return 'Record an Audio Message';
      case 'album':
        return 'Create a Memory Album';
      default:
        return 'Create Content';
    }
  };
  
  const getDescription = () => {
    switch (contentType) {
      case 'loveLetter':
        return 'Express your feelings in words that will last forever';
      case 'galleryItem':
        return 'Share your special moments through photos and videos';
      case 'audioMessage':
        return 'Send your voice across the distance';
      case 'album':
        return 'Organize your memories into beautiful collections';
      default:
        return 'Create and share meaningful content';
    }
  };
  
  const handleError = (error: unknown, context: string) => {
    ErrorLogger.log(
      `Error in content modal: ${context}`,
      'medium',
      'CreateContentModal',
      error instanceof Error ? error : new Error(String(error)),
      { contentType, context }
    );
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };
  
  const renderForm = () => {
    try {
      switch (contentType) {
        case 'loveLetter':
          return (
            <CreateLoveLetterForm 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          );
        case 'galleryItem':
          return (
            <UploadGalleryItemForm 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          );
        case 'audioMessage':
          return (
            <RecordAudioMessageForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          );
        case 'album':
          return (
            <CreateAlbumForm 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          );
        default:
          return <div>Select a content type to create</div>;
      }
    } catch (error) {
      handleError(error, 'renderForm');
      return <div>Error loading form. Please try again.</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-lg mx-auto",
          "sm:max-w-3xl md:max-w-4xl",
          "p-0 border-none",
          "bg-transparent shadow-none",
          "overflow-hidden"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              duration: 0.4,
              bounce: 0.2
            }}
          >
            {contentType === 'audioMessage' && (
              <RecordAudioMessageForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
            {/* Add other content type forms here */}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default CreateContentModal;