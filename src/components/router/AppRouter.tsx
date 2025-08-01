import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// // no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(
  () => import('@/components/layouts/AuthLayout/AuthLayout'),
);

import MainLayout from '@/components/layouts/main/MainLayout/MainLayout';
import { eventDetailRoutes } from '@/routes/eventDetailRoutes';

import RequireAuth from '@/components/router/RequireAuth';

import { withLoading } from '@/hocs/withLoading.hoc';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { NotFound } from '../common/NotFound/NotFound';
import ScrollToTop from '../common/ScrollToTop';
import { GlobalErrorHandler } from '../common/GlobalErrorHandler/GlobalErrorHandler';
import { ErrorBoundary } from '../common/ErrorBoundary/ErrorBoundary';
const EventDashboardPage = React.lazy(
  () => import('@/pages/EventDashboardPage'),
);

const EventCreatePage = React.lazy(() => import('@/pages/EventCreatePage'));
const CheckInPage = React.lazy(() => import('@/components/layouts/CheckIn'));
const QuizActiveGamePage = React.lazy(
  () => import('@/pages/EventDetailPage/GameManagementPage/QuizActiveGamePage'),
);
const QuizWaitingRoomPage = React.lazy(
  () =>
    import('@/pages/EventDetailPage/GameManagementPage/QuizWaitingRoomPage'),
);
// const QuizPlayPage = React.lazy(
//   () => import('@/pages/EventDetailPage/GameManagementPage/QuizPlayPage'),
// );
// const QuizResultsPage = React.lazy(
//   () => import('@/pages/EventDetailPage/GameManagementPage/QuizResultsPage'),
// );

const AuthLayoutFallback = withLoading(AuthLayout);

export const AppRouter: React.FC = () => {
  const protectedLayout = (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <GlobalErrorHandler />
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={protectedLayout}>
            <Route index element={<Navigate to="/events" replace />} />
            <Route path="events" element={<EventDashboardPage />} />
            <Route path="create-event" element={<EventCreatePage />}>
              <Route
                index
                element={<Navigate to="/create-event?step=info" replace />}
              />
              <Route path=":eventId" element={<EventCreatePage />} />
            </Route>

            <Route path="export-file" element={<NotFound />} />
            <Route path="legal-document" element={<NotFound />} />
          </Route>

          {/* Event Detail Routes */}
          {eventDetailRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element}>
              {route.children?.map((childRoute) => (
                <Route
                  key={childRoute.path}
                  path={childRoute.path}
                  element={childRoute.element}
                />
              ))}
            </Route>
          ))}

          <Route
            path="/events/:eventId/check-in/:checkInListShortId"
            element={<CheckInPage />}
          />

          <Route
            path="/events/:eventId/shows/:showId/game-management/:quizId/active/:code"
            element={<QuizActiveGamePage />}
          />

          <Route
            path="/events/:eventId/shows/:showId/game-management/:quizId/play/waiting-room"
            element={<QuizWaitingRoomPage />}
          />

          <Route path="/auth" element={<AuthLayoutFallback />}>
            <Route
              path="login"
              element={<SignIn signUpUrl="/auth/sign-up" />}
            />
            <Route path="sign-up" element={<SignUp />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
