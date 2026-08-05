import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LandingPage, JobDetailPage, JobsPage, NotFoundPage } from './pages/PublicPages';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ApplyJobPage, MyApplicationsPage, ProfilePage, SavedJobsPage } from './pages/applicant/ApplicantPages';
import {
  CandidatesPage,
  DashboardPage,
  JobFormPage,
  PipelinePage,
  RankingPage,
} from './pages/recruiter/RecruiterPages';

const Guard = ({ role, children }) => <ProtectedRoute role={role}>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/applicant" element={<RegisterPage role="applicant" />} />
        <Route path="/register/recruiter" element={<RegisterPage role="recruiter" />} />
        <Route path="/applicant/applications" element={<Guard role="applicant"><MyApplicationsPage /></Guard>} />
        <Route path="/applicant/jobs/:jobId/apply" element={<Guard role="applicant"><ApplyJobPage /></Guard>} />
        <Route path="/applicant/profile" element={<Guard role="applicant"><ProfilePage /></Guard>} />
        <Route path="/applicant/saved" element={<Guard role="applicant"><SavedJobsPage /></Guard>} />
        <Route path="/recruiter" element={<Guard role="recruiter"><DashboardPage /></Guard>} />
        <Route path="/recruiter/candidates" element={<Guard role="recruiter"><CandidatesPage /></Guard>} />
        <Route path="/recruiter/jobs/new" element={<Guard role="recruiter"><JobFormPage /></Guard>} />
        <Route path="/recruiter/jobs/:jobId/edit" element={<Guard role="recruiter"><JobFormPage /></Guard>} />
        <Route path="/recruiter/jobs/:jobId/applications" element={<Guard role="recruiter"><PipelinePage /></Guard>} />
        <Route path="/recruiter/jobs/:jobId/ranking" element={<Guard role="recruiter"><RankingPage /></Guard>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
