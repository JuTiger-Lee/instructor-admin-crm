import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import DashboardPage from './pages/DashboardPage'
import InstructorListPage from './pages/InstructorListPage'
import InstructorCreatePage from './pages/InstructorCreatePage'
import InstructorEditPage from './pages/InstructorEditPage'
import FieldManagementPage from './pages/FieldManagementPage'
import GradeManagementPage from './pages/GradeManagementPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <Routes>
      {/* 공개 라우트 — 로그인 상태면 홈으로 리다이렉트 */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 보호된 라우트 — 미인증 시 로그인으로 리다이렉트 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/instructors" element={<InstructorListPage />} />
          <Route path="/instructors/new" element={<InstructorCreatePage />} />
          <Route path="/instructors/:id/edit" element={<InstructorEditPage />} />
          <Route path="/fields" element={<FieldManagementPage />} />
          <Route path="/grades" element={<GradeManagementPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
