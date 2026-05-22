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
  const { loading, error } = useAuth();

  const shouldShowInitialLoader = loading && !error;

  if (shouldShowInitialLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"
          aria-label="Carregando"
        />
      </div>
    );
  }

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
