// Tour Analytics Service
import { TourState, TourAnalyticsEvent } from './types';
import { TOUR_STORAGE_KEY, TOUR_ANALYTICS_EVENTS } from './tourSteps';

// Get user ID from localStorage JWT if available
function getUserId(): string | null {
  try {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;
    
    // Decode JWT payload (basic decode, not verification)
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

// Analytics tracking function
export function trackTourEvent(
  eventName: string, 
  payload: Partial<TourAnalyticsEvent['payload']>
): void {
  const fullPayload: TourAnalyticsEvent['payload'] = {
    ...payload,
    userId: getUserId(),
    timestamp: Date.now()
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Tour Analytics] ${eventName}`, fullPayload);
  }

  // Send to analytics service (implement based on your analytics provider)
  // Example: window.gtag?.('event', eventName, fullPayload);
  // Example: window.analytics?.track(eventName, fullPayload);
  
  // Dispatch custom event for any listeners
  window.dispatchEvent(new CustomEvent('novatrade:analytics', {
    detail: { event: eventName, payload: fullPayload }
  }));
}

// Tour state persistence
export function getTourState(): TourState | null {
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as TourState;
  } catch {
    return null;
  }
}

export function saveTourState(state: Partial<TourState>): void {
  try {
    const currentState = getTourState() || {
      completed: false,
      completedAt: null,
      lastStepId: null,
      skipped: false,
      timeTakenMs: null
    };

    const newState = { ...currentState, ...state };
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(newState));

    // Optionally sync to server if user is authenticated
    syncTourStateToServer(newState);
  } catch (error) {
    console.error('Failed to save tour state:', error);
  }
}

export function clearTourState(): void {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

// Server sync (optional)
async function syncTourStateToServer(state: TourState): Promise<void> {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) return;

  try {
    await fetch('/api/users/me/tour-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        tourKey: TOUR_STORAGE_KEY,
        completed: state.completed,
        completedAt: state.completedAt,
        skipped: state.skipped
      })
    });
  } catch {
    // Silently fail - tour state sync is not critical
  }
}

// Track tour start
export function trackTourStart(entryPoint: string = 'view_demo_button'): void {
  trackTourEvent(TOUR_ANALYTICS_EVENTS.START, { entryPoint });
}

// Track step navigation
export function trackTourStep(stepId: string, stepIndex: number): void {
  trackTourEvent(TOUR_ANALYTICS_EVENTS.STEP, { stepId, stepIndex });
  saveTourState({ lastStepId: stepId });
}

// Track tour skip
export function trackTourSkip(stepId: string): void {
  trackTourEvent(TOUR_ANALYTICS_EVENTS.SKIP, { stepId });
  saveTourState({ skipped: true, lastStepId: stepId });
}

// Track tour completion
export function trackTourComplete(timeTakenMs: number): void {
  trackTourEvent(TOUR_ANALYTICS_EVENTS.COMPLETE, { timeTakenMs });
  saveTourState({ 
    completed: true, 
    completedAt: Date.now(), 
    timeTakenMs,
    skipped: false 
  });
}

// Track tour replay
export function trackTourReplay(): void {
  trackTourEvent(TOUR_ANALYTICS_EVENTS.REPLAY, {});
  clearTourState();
}

// Check if tour has been completed
export function isTourCompleted(): boolean {
  const state = getTourState();
  return state?.completed ?? false;
}
