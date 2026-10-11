import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';

// Public pages
import { LandingPage } from '../features/landing/LandingPage.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { SignupPage } from '../features/auth/SignupPage.jsx';
import { NotFoundPage } from '../features/landing/NotFoundPage.jsx';

// Application pages
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { RepositoryListPage } from '../features/repositories/RepositoryListPage.jsx';
import { RepositoryDetailPage } from '../features/repositories/RepositoryDetailPage.jsx';
import { FileExplorerPage } from '../features/repositories/FileExplorerPage.jsx';
import { AssistantPage } from '../features/assistant/AssistantPage.jsx';
import { ReviewsListPage } from '../features/reviews/ReviewsListPage.jsx';
import { ReviewDetailPage } from '../features/reviews/ReviewDetailPage.jsx';
import { JobsPage } from '../features/jobs/JobsPage.jsx';
import { JobDetailPage } from '../features/jobs/JobDetailPage.jsx';
import { TestingDashboardPage } from '../features/testing/TestingDashboardPage.jsx';
import { SettingsPage } from '../features/settings/SettingsPage.jsx';
import { ProfilePage } from '../features/profile/ProfilePage.jsx';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },

  // Authenticated Application routes
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'repositories',
        element: <RepositoryListPage />,
      },
      {
        path: 'repositories/:repositoryId',
        element: <RepositoryDetailPage />,
      },
      {
        path: 'repositories/:repositoryId/files',
        element: <FileExplorerPage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
      {
        path: 'assistant/:conversationId',
        element: <AssistantPage />,
      },
      {
        path: 'reviews',
        element: <ReviewsListPage />,
      },
      {
        path: 'reviews/:reviewId',
        element: <ReviewDetailPage />,
      },
      {
        path: 'jobs',
        element: <JobsPage />,
      },
      {
        path: 'jobs/:jobId',
        element: <JobDetailPage />,
      },
      {
        path: 'testing',
        element: <TestingDashboardPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // 404 Catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
