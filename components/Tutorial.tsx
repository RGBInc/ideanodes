
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check } from 'lucide-react';
import { audio } from '../services/audioService';

interface TutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Ideanodes",
    content: "Ideanodes is a sequential thinking engine designed to mimic how the human brain processes and expands upon ideas. It's more than a notepad—it's a co-processor for your thoughts.",
  },
  {
    title: "The Logic Chain",
    content: "Ideas are represented as 'Nodes'. Each node is connected to the previous one, creating a logical chain of reasoning. Start with a problem, and iterate towards a solution.",
  },
  {
    title: "AI Expansion",
    content: "Stuck? Click 'Generate Next Step'. The AI analyzes your entire chain of thought and predicts the logical next node—whether it's a solution, a technical spec, or a critique.",
  },
  {
    title: "Structural Remixing",
    content: "This is the superpower. Click 'Remix' to take the *structure* of your thinking (e.g. Problem -> Insight -> Solution) and apply it to a completely different topic automatically.",
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    audio.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
              <button onClick={onComplete} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 h-24">
                  {steps[currentStep].content}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 group"
            >
              {currentStep === steps.length - 1 ? (
                <>Get Started <Check size={18} /></>
              ) : (
                <>Next <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Tutorial;
