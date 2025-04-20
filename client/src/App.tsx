import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GroupsPage from "@/pages/groups-page";
import MeetingsPage from "@/pages/meetings-page";
import NotesPage from "@/pages/notes-page";
import ChatPage from "@/pages/chat-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import Navigation from "./components/navigation";
import Footer from "./components/footer";

function Router() {
  return (
    <>
      <Navigation />
      <main className="flex-grow">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/groups" component={GroupsPage} />
          <ProtectedRoute path="/meetings" component={MeetingsPage} />
          <ProtectedRoute path="/notes" component={NotesPage} />
          <ProtectedRoute path="/chat" component={ChatPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#f0fdf4]">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
