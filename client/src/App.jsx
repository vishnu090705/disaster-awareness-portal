import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import AdminVideo from "./pages/AdminVideo";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import EarthquakeQuiz from "./pages/EarthquakeQuiz";
import AdminSchools from "./pages/AdminSchools";
import AdminPrincipals from "./pages/AdminPrincipals"
import AdminStudents from "./pages/AdminStudents";
import AdminDashboard from "./pages/AdminDashboard";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleView from "./pages/ModuleView";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import CreateModule from "./pages/admin/CreateModule";
import AdminModules from "./pages/admin/AdminModules";
import EditModule from "./pages/admin/EditModule";
import PrincipalLayout from "./layouts/PrincipalLayout";
import PrincipalDashboard from "./pages/principal/PrincipalDashboard";
import ChangePassword from "./pages/ChangePassword";
import PrincipalTickets from "./pages/PrincipalTickets";
import PrincipalStudents from "./pages/principal/PrincipalStudents";
import StudentDetail from "./pages/principal/StudentDetail";
import PrincipalAnalytics from "./pages/principal/PrincipalAnalytics";
import PrincipalReports from "./pages/PrincipalReports";
import AdminTickets from "./pages/AdminTickets";
import CreateQuiz from "./pages/admin/CreateQuiz";
import QuizList from "./pages/admin/QuizList";
import EditQuiz from "./pages/admin/EditQuiz";
import QuizResult from "./pages/QuizResult";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-upload" element={<AdminVideo />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/module" element={<Modules />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/quiz/:moduleId" element={<Quiz />} />
        <Route path="/admin/schools" element={<AdminSchools />} />
        <Route path="/admin/principals" element={<AdminPrincipals />} />
        <Route path="/admin/students" element={<AdminStudents />} />
       <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/module/:id" element={<ModuleDetail />} />
        <Route path="/admin/modules" element={<AdminModules />} />
        <Route path="/admin/modules/create" element={<CreateModule />} />
        <Route path="/principal/students" element={<PrincipalStudents />} />
        <Route path="/principal/students/:id"element={<StudentDetail />}/>
        <Route path="/principal/analytics"element={<PrincipalAnalytics />}/>
        <Route path="/principal/reports" element={<PrincipalReports />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/create-quiz" element={<CreateQuiz />} />
        <Route path="/admin/quizzes" element={<QuizList />} />
        <Route path="/admin/edit-quiz/:id" element={<EditQuiz />} />
        <Route path="/module/:id" element={<ModuleView />} />
        <Route path="/quiz-result/:id" element={<QuizResult />} />




        <Route path="/principal" element={<PrincipalLayout />}>

  <Route index element={<PrincipalDashboard />} />

  <Route path="tickets" element={<PrincipalTickets />} />

  <Route path="change-password" element={<ChangePassword />} />
  
</Route>

<Route
  path="/admin/modules/edit/:id"
  element={<EditModule />}
/>
<Route
  path="/admin/modules/edit/:id"
  element={<EditModule />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;