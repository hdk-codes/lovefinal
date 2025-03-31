export interface Message {
  id: string;
  content: string;
  // ...add other message properties you need
}

export interface DraggableMessage extends Message {
  index: number;
}
