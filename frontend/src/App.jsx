import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import DashboardLayout from './components/DashboardLayout'
import WelcomeScreen from './components/WelcomeScreen'
import OnboardingTour from './components/OnboardingTour'
import useOnboarding, { getDashboardTourSteps } from './hooks/useOnboarding'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EnhancedDashboard from './pages/EnhancedDashboard'
import Analytics from './pages/Analytics'
import CompetencyExplorer from './pages/CompetencyExplorer'
import CompetenciesWithTest from './pages/CompetenciesWithTest'
import CompetencyDetail from './pages/CompetencyDetail'
import CompetencyLearningPage from './pages/CompetencyLearningPage'
import Assessment from './pages/Assessment'
import AssessmentWelcome from './pages/AssessmentWelcome'
import AssessmentTest from './pages/AssessmentTest'
import AssessmentResults from './pages/AssessmentResults'
import LearningPaths from './pages/LearningPaths'
import MyPaths from './pages/MyPaths'
import PathGenerator from './pages/PathGenerator'
import LearningPathView from './pages/LearningPathView'
import ResourceDetail from './pages/ResourceDetail'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Test from './pages/Test'
import KnowledgeGraphPage from './pages/KnowledgeGraphPage'
import GoalSetting from './pages/GoalSetting'
import CareerPathways from './pages/CareerPathways'
import CertificationPrep from './pages/CertificationPrep'
import GlobalSearch from './pages/GlobalSearch'

function App() {
  const { showWelcome, showTour, completeWelcome, completeTour, skipTour } = useOnboarding()

  return (
    <AuthProvider>
      {showWelcome && <WelcomeScreen onComplete={completeWelcome} />}
      <OnboardingTour
        steps={getDashboardTourSteps()}
        run={showTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />
      <Routes>
        {/* Test Route */}
        <Route path="/test" element={<Test />} />

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Dashboard Layout - No authentication in DEV mode */}
        <Route path="/dashboard" element={<DashboardLayout><EnhancedDashboard /></DashboardLayout>} />
        <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/competencies" element={<DashboardLayout><CompetencyExplorer /></DashboardLayout>} />
        <Route path="/competencies/:competencyId" element={<DashboardLayout><CompetencyDetail /></DashboardLayout>} />
        <Route path="/competencies-test" element={<DashboardLayout><CompetenciesWithTest /></DashboardLayout>} />
        <Route path="/assessment-welcome" element={<DashboardLayout><AssessmentWelcome /></DashboardLayout>} />
        <Route path="/assessment" element={<DashboardLayout><Assessment /></DashboardLayout>} />
        <Route path="/assessment/test" element={<DashboardLayout><AssessmentTest /></DashboardLayout>} />
        <Route path="/assessment/results" element={<DashboardLayout><AssessmentResults /></DashboardLayout>} />

        {/* Learning Path Routes */}
        <Route path="/my-paths" element={<DashboardLayout><MyPaths /></DashboardLayout>} />
        <Route path="/my-paths/:pathId" element={<DashboardLayout><LearningPathView /></DashboardLayout>} />
        <Route path="/path-generator" element={<DashboardLayout><PathGenerator /></DashboardLayout>} />
        <Route path="/learning-paths" element={<DashboardLayout><LearningPaths /></DashboardLayout>} />

        {/* Resource Routes - Both paths now use the same unified Resources component */}
        <Route path="/resource-library" element={<DashboardLayout><Resources /></DashboardLayout>} />
        <Route path="/resources" element={<DashboardLayout><Resources /></DashboardLayout>} />
        <Route path="/resources/:resourceId" element={<DashboardLayout><ResourceDetail /></DashboardLayout>} />

        {/* Knowledge Graph Route */}
        <Route path="/knowledge-graph" element={<DashboardLayout><KnowledgeGraphPage /></DashboardLayout>} />

        {/* Competency Learning Route */}
        <Route path="/learn/:competencyId" element={<DashboardLayout><CompetencyLearningPage /></DashboardLayout>} />

        {/* New MVP Features */}
        <Route path="/goals" element={<DashboardLayout><GoalSetting /></DashboardLayout>} />
        <Route path="/career-pathways" element={<DashboardLayout><CareerPathways /></DashboardLayout>} />
        <Route path="/certifications" element={<DashboardLayout><CertificationPrep /></DashboardLayout>} />
        <Route path="/search" element={<DashboardLayout><GlobalSearch /></DashboardLayout>} />

        <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
