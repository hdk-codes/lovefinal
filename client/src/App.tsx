import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import HeartBackground from "./components/HeartBackground";
import CreateContentButton from "./components/CreateContentButton";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { DragDropContext } from 'react-beautiful-dnd';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

const App = () => {
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    // Add any drag end handling logic here
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <DragDropContext onDragEnd={onDragEnd} enableDefaultSensors={true}>
          <HeartBackground />
          <Router />
          <CreateContentButton />
          <Toaster />
        </DragDropContext>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
