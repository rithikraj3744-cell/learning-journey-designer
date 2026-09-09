import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const OnboardingTour = ({ steps = [], run = false, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Always define step before any early returns or conditional logic
  const step = steps[currentStep] || {};
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (run) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [run]);

  // Highlight target element - must be before early return
  useEffect(() => {
    if (!isVisible || !step.target) return;

    const target = document.querySelector(step.target);
    if (target) {
      target.classList.add('onboarding-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (target) {
        target.classList.remove('onboarding-highlight');
      }
    };
  }, [isVisible, currentStep, step.target]);

  if (!isVisible || !steps.length) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleSkipTour = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  // Calculate position based on target element
  const getTooltipPosition = () => {
    if (!step.target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const target = document.querySelector(step.target);
    if (!target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = target.getBoundingClientRect();
    const position = step.placement || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn" />

      {/* Tooltip */}
      <div
        className="fixed z-50 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 animate-scaleIn"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkipTour}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300">{step.content}</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleSkipTour}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 0.5rem;
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;
