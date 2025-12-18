
import React, { useState, useEffect } from 'react';
import { View, Question, Result } from './types';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ExamHall from './components/ExamHall';
import Home from './components/Home';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import ResultCertificate from './components/ResultCertificate';
import AIChatbot from './components/AIChatbot';
import { GraduationCap, Code, LayoutDashboard, Database, Trophy, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Result | null>(null);

  // Initialize Data
  useEffect(() => {
    const savedQs = localStorage.getItem('exam_questions');
    const savedResults = localStorage.getItem('exam_results');
    if (savedQs) setQuestions(JSON.parse(savedQs));
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  const saveQuestions = (newQs: Question[]) => {
    setQuestions(newQs);
    localStorage.setItem('exam_questions', JSON.stringify(newQs));
  };

  const saveResults = (newResults: Result[]) => {
    setResults(newResults);
    localStorage.setItem('exam_results', JSON.stringify(newResults));
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to exit?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d63031',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentView(View.Home);
      }
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Home:
        return <Home setView={setCurrentView} />;
      case View.AdminLogin:
        return <AdminLogin onLogin={() => setCurrentView(View.AdminDashboard)} onBack={() => setCurrentView(View.Home)} />;
      case View.StudentLogin:
        return (
          <StudentLogin 
            onLogin={(subject) => {
              setActiveSubject(subject);
              setCurrentView(View.ExamHall);
            }} 
            questions={questions}
            onBack={() => setCurrentView(View.Home)} 
          />
        );
      case View.AdminDashboard:
        return (
          <div className="flex min-h-screen">
            <Sidebar 
              currentView={currentView} 
              onLogout={handleLogout} 
            />
            <main className="flex-1 p-8 overflow-y-auto">
              <AdminDashboard 
                questions={questions} 
                setQuestions={saveQuestions} 
                results={results}
                clearData={() => {
                   saveQuestions([]);
                   saveResults([]);
                   Swal.fire('Data Reset!', 'All questions and results have been wiped.', 'success');
                }}
              />
            </main>
          </div>
        );
      case View.ExamHall:
        if (!activeSubject) return null;
        return (
          <ExamHall 
            subject={activeSubject} 
            questions={questions.filter(q => q.subject === activeSubject)} 
            onFinish={(result) => {
              const newResults = [...results, result];
              saveResults(newResults);
              setLastResult(result);
              setCurrentView(View.Result);
            }}
          />
        );
      case View.Result:
        return lastResult ? (
          <ResultCertificate 
            result={lastResult} 
            onClose={() => setCurrentView(View.Home)} 
          />
        ) : null;
      default:
        return <Home setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      {renderContent()}
      {currentView !== View.ExamHall && <AIChatbot />}
    </div>
  );
};

export default App;
