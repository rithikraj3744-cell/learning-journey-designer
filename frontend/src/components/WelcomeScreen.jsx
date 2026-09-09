import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Map, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import Confetti from './Confetti';

const WelcomeScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Learning Journey!',
      description: 'Your personalized AI-powered learning companion is ready to help you achieve your goals.',
      action: 'Get Started'
    },
    {
      icon: Target,
      title: 'Assess Your Skills',
      description: 'Take our AI-powered assessment to identify your current competency levels and skill gaps.',
      action: 'Continue'
    },
    {
      icon: Map,
      title: 'Get Your Learning Path',
      description: 'Receive a personalized learning journey tailored to your goals and current skill level.',
      action: 'Continue'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your learning journey with detailed analytics, achievements, and milestones.',
      action: "Let's Begin!"
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
        navigate('/assessment');
      }, 2000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 animate-fadeIn">
      <Confetti active={showConfetti} duration={2000} />

      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 animate-scaleIn">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-blue-600 dark:bg-blue-400'
                  : idx < currentStep
                  ? 'w-2 bg-blue-400 dark:bg-blue-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6">
            <Icon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            {step.description}
          </p>
        </div>

        {/* Features (only on first step) */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                100+ Competencies
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI-Powered Paths
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress Tracking
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {currentStep === 0 && (
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Skip Introduction
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            {step.action}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Step indicator text */}
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
