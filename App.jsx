import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import Dashboard from './pages/Dashboard';
import Equipe from './pages/Equipe';
import Produtividade from './pages/Produtividade';
import Relatorios from './pages/Relatorios';
import { ThemeProvider } from './hooks/useTheme';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="px-4 py-4 flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/produtividade" element={<Produtividade />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
