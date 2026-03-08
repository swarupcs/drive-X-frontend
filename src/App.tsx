import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store, useAppSelector } from "@/store";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import MyDrive from "@/pages/drive/MyDrive";
import FolderView from "@/pages/drive/FolderView";
import Recent from "@/pages/drive/Recent";
import Starred from "@/pages/drive/Starred";
import Shared from "@/pages/drive/Shared";
import TrashPage from "@/pages/drive/Trash";
import StoragePage from "@/pages/drive/Storage";
import ActivityPage from "@/pages/drive/ActivityPage";
import ProfilePage from "@/pages/drive/ProfilePage";
import PublicShare from "@/pages/share/PublicShare";
import AdminDashboard from "@/pages/admin/Dashboard";
import UsersPage from "@/pages/admin/UsersPage";
import FilesPage from "@/pages/admin/FilesPage";
import AdminStoragePage from "@/pages/admin/StoragePage";
import SharesPage from "@/pages/admin/SharesPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (role !== "admin") return <Redirect to="/drive" />;
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Redirect to="/drive" />;
  return <>{children}</>;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/drive" />
      </Route>

      <Route path="/login">
        <AuthRedirect><Login /></AuthRedirect>
      </Route>
      <Route path="/register">
        <AuthRedirect><Register /></AuthRedirect>
      </Route>

      <Route path="/share/:linkId">
        {(params) => <PublicShare linkId={params.linkId} />}
      </Route>

      <Route path="/drive">
        <ProtectedRoute>
          <AppLayout><MyDrive /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/folder/:folderId">
        {(params) => (
          <ProtectedRoute>
            <AppLayout><FolderView folderId={params.folderId} /></AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/drive/recent">
        <ProtectedRoute>
          <AppLayout><Recent /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/starred">
        <ProtectedRoute>
          <AppLayout><Starred /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/shared">
        <ProtectedRoute>
          <AppLayout><Shared /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/activity">
        <ProtectedRoute>
          <AppLayout><ActivityPage /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/trash">
        <ProtectedRoute>
          <AppLayout><TrashPage /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/storage">
        <ProtectedRoute>
          <AppLayout><StoragePage /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/drive/profile">
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <AdminRoute>
          <AppLayout><AdminDashboard /></AppLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AppLayout><UsersPage /></AppLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/files">
        <AdminRoute>
          <AppLayout><FilesPage /></AppLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/storage">
        <AdminRoute>
          <AppLayout><AdminStoragePage /></AppLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/shares">
        <AdminRoute>
          <AppLayout><SharesPage /></AppLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </AdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
