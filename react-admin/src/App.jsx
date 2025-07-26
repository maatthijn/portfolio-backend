import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login';
import Blogs from './pages/Blogs';
import Galleries from './pages/Galleries';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoutes';
import Menu from './pages/Menu';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Login />} />
          <Route
            path='/menu'
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path='/blogs'
            element={<ProtectedRoute>
              <Blogs />
            </ProtectedRoute>}
          />
          <Route
            path='/galleries'
            element={
              <ProtectedRoute>
                <Galleries />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}