import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Heart, Image, Mic, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateContentModal, ContentType } from './CreateContentModal';
import { cn } from "@/lib/utils";

export function CreateContentButton() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ContentType | null;
  }>({
    isOpen: false,
    type: null
  });

  const handleOpenModal = (type: ContentType) => {
    setModalState({ isOpen: true, type });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const menuItems = [
    { type: 'loveLetter', icon: Heart, label: 'Write a Love Letter', color: 'text-pink-600' },
    { type: 'galleryItem', icon: Image, label: 'Share a Photo/Video', color: 'text-blue-500' },
    { type: 'audioMessage', icon: Mic, label: 'Record Voice Message', color: 'text-red-500' },
    { type: 'album', icon: BookOpen, label: 'Create Memory Album', color: 'text-purple-500' }
  ] as const;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "rounded-full w-14 h-14 p-0",
              "bg-gradient-to-r from-pink-500 to-purple-500",
              "hover:from-pink-600 hover:to-purple-600",
              "text-white shadow-lg",
              "flex items-center justify-center",
              "transition-all duration-300 ease-out",
              "hover:scale-110",
              "active:scale-95"
            )}
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 p-2 bg-white/95 backdrop-blur-sm border border-pink-100 shadow-xl rounded-xl"
        >
          <DropdownMenuLabel className="text-pink-800 font-semibold px-2 py-3">
            Create New Content
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-100/50" />
          
          {menuItems.map(({ type, icon: Icon, label, color }) => (
            <DropdownMenuItem
              key={type}
              onClick={() => handleOpenModal(type as ContentType)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                "hover:bg-pink-50 focus:bg-pink-50",
                "transition-colors duration-150"
              )}
            >
              <Icon className={cn("h-5 w-5", color)} />
              <span className="font-medium text-gray-700">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {modalState.type && (
        <CreateContentModal
          open={modalState.isOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
          contentType={modalState.type}
          onSuccess={() => {
            handleCloseModal();
            // Trigger any refresh/update logic here
          }}
        />
      )}
    </>
  );
}

export default CreateContentButton;