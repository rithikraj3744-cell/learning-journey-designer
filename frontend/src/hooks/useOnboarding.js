import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'learning_journey_onboarding_completed';
const TOUR_KEY = 'learning_journey_tour_completed';

export const useOnboarding = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY);
    const tourCompleted = localStorage.getItem(TOUR_KEY);

    if (!onboardingCompleted) {
      setShowWelcome(true);
    } else if (!tourCompleted) {
      // Show tour on next visit after welcome is completed
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);

  const completeWelcome = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowWelcome(false);
    // Optionally start tour immediately after welcome
    setTimeout(() => setShowTour(true), 500);
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(TOUR_KEY);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    showTour,
    completeWelcome,
    completeTour,
    skipTour,
    resetOnboarding
  };
};

// Dashboard tour steps
export const getDashboardTourSteps = () => [
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    content: 'Access all major features from here. Click the arrow to collapse the sidebar and get more space.',
    placement: 'right'
  },
  {
    target: '[data-tour="search"]',
    title: 'Global Search',
    content: 'Quickly find competencies, resources, and learning paths using the search bar.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content: 'Stay updated with your learning progress, achievements, and recommendations.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="stats"]',
    title: 'Your Progress',
    content: 'Track your learning statistics at a glance. See completed competencies, time spent, and more.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="ai-assistant"]',
    title: 'AI Learning Assistant',
    content: 'Get instant help, explanations, and personalized recommendations from our AI assistant.',
    placement: 'left'
  }
];

// Competencies page tour steps
export const getCompetenciesTourSteps = () => [
  {
    target: '[data-tour="competency-filters"]',
    title: 'Filter Competencies',
    content: 'Filter by domain, difficulty level, or your progress to find relevant competencies.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="competency-card"]',
    title: 'Competency Details',
    content: 'Click on any competency to view detailed information, prerequisites, and learning resources.',
    placement: 'top'
  },
  {
    target: '[data-tour="progress-indicator"]',
    title: 'Track Progress',
    content: 'Visual indicators show your progress on each competency. Update your status as you learn.',
    placement: 'top'
  }
];

export default useOnboarding;
