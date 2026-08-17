import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProjectsPage from './pages/ProjectsPage'
import NewProjectPage from './pages/NewProjectPage'
import EditorPage from './pages/EditorPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="new" element={<NewProjectPage />} />
        <Route path="editor/:jobId" element={<EditorPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
