import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AudioUpload from "./pages/AudioUpload";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import FullCalendarPage from "./pages/FullCalendarPage";
import NotificationsAdvanced from "./pages/NotificationsAdvanced";
import PDFReports from "./pages/PDFReports";
import PasswordReset from "./pages/PasswordReset";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function Router() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }
  
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/audio"} component={AudioUpload} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/fullcalendar"} component={FullCalendarPage} />
      <Route path={"/notifications-advanced"} component={NotificationsAdvanced} />
      <Route path={"/pdf-reports"} component={PDFReports} />
      <Route path={"/password-reset"} component={PasswordReset} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
