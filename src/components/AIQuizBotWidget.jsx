import React, { useState } from 'react';
import { X, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import API from '../api/axios';

const classesList = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];

export default function AIQuizBotWidget({ defaultClass = 'Class 10' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('SELECT_CONFIG');
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await API.post('/ai-tutor/get-quiz', {
        studentClass: selectedClass,
        subject: selectedSubject
      });
      const data = res.data?.data?.questions || [];
      if (data.length > 0) {
        setQuizList(data);
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setStep('PLAYING');
      } else {
        alert('No quiz available for this selection.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === quizList[currentIndex].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setStep('RESULT');
    }
  };

  const resetQuiz = () => {
    setStep('SELECT_CONFIG');
    setQuizList([]);
    setCurrentIndex(0);
    setScore(0);
  };

  const currentQ = quizList[currentIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white pl-2.5 pr-4 py-2.5 rounded-full shadow-2xl shadow-blue-600/50 border border-blue-400/40 flex items-center gap-2.5 hover:scale-105 transition-all cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center font-black text-[10px] text-amber-400">
            AB
          </div>
          <span className="text-xs font-black tracking-wider text-white uppercase">
            AI Quiz Bot
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] md:w-[420px] bg-slate-900 border border-blue-900/50 rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in">
          <div className="bg-slate-950 px-5 py-4 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black text-xs">
                AB
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-wide uppercase">AB School AI Quiz Bot</h4>
                <p className="text-[10px] text-amber-400 font-mono font-semibold">CBSE Assessment • Class 1 to 10</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            {step === 'SELECT_CONFIG' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">1. Select Your Class (1 to 10)</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                  >
                    {classesList.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">2. Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Science">Science (EVS / General Science)</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all mt-4"
                >
                  {loading ? 'Preparing Questions...' : 'Start AI Quiz Challenge'}
                  {!loading && <ArrowRight className="w-4 h-4 text-amber-300" />}
                </button>
              </div>
            )}

            {step === 'PLAYING' && currentQ && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Question {currentIndex + 1} of {quizList.length}</span>
                  <span className="text-amber-400 font-bold">Score: {score}</span>
                </div>

                <p className="text-sm font-bold text-white leading-relaxed">{currentQ.question}</p>

                <div className="space-y-2">
                  {currentQ.options.map((option, idx) => {
                    let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500';
                    if (isAnswered) {
                      if (idx === currentQ.correctIndex) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                      } else if (idx === selectedOption) {
                        btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${btnStyle}`}
                      >
                        {String.fromCharCode(65 + idx)}. {option}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-amber-400">Explanation:</p>
                    <p className="text-slate-300">{currentQ.explanation}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNext}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow"
                      >
                        {currentIndex + 1 === quizList.length ? 'View Result' : 'Next Question'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'RESULT' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-blue-600/20 text-amber-400 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                  {score}/{quizList.length}
                </div>
                <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
                <p className="text-xs text-slate-400">
                  {score === quizList.length ? 'Outstanding performance! Keep it up.' : 'Good attempt! Revise topics to improve score.'}
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow"
                >
                  <RotateCcw className="w-4 h-4" /> Try Another Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
