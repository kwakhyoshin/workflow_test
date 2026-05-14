import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import RequestPage  from './pages/RequestPage'
import CsrListPage  from './pages/CsrListPage'
import CsrDetailPage from './pages/CsrDetailPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index           element={<RequestPage   />} />
          <Route path="csr"      element={<CsrListPage   />} />
          <Route path="csr/:id"  element={<CsrDetailPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
