import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ActionBar } from '@/components/layout/ActionBar';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { MotionPrefProvider, useMotionPref } from '@/hooks/useMotionPref';
import Home from '@/pages/Home';

const Booking = lazy(() => import('@/pages/Booking'));
const ManageBooking = lazy(() => import('@/pages/ManageBooking'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Admin = lazy(() => import('@/pages/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="grid min-h-[100svh] place-items-center" role="status" aria-label="Carregando">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-brass/20 border-t-brass" />
    </div>
  );
}

function Shell() {
  const { reduced } = useMotionPref();
  const { pathname } = useLocation();
  const immersive = pathname.startsWith('/agendar') || pathname.startsWith('/admin');
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <a href="#conteudo" className="sr-only z-[70] rounded-full bg-brass px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <ScrollToTop />
      {!immersive && (
        <>
          <ScrollProgress />
          <Header />
        </>
      )}
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendar" element={<Booking />} />
          <Route path="/meu-agendamento" element={<ManageBooking />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!immersive && <Footer />}
      <ActionBar />
    </MotionConfig>
  );
}

// Hash routing for static previews hosted under an unknown sub-path (VITE_HASH_ROUTER=1).
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MotionPrefProvider>
        <div className="grain">
          <Shell />
        </div>
      </MotionPrefProvider>
    </Router>
  );
}
