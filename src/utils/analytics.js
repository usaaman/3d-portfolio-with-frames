import { db } from '../services/firebase';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';

let currentSessionId = null;
let sessionStartTime = null;
let maxScrollDepth = 0;

// Generate unique ID
function generateId(prefix = '') {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

export function initAnalytics() {
  if (!db) return;

  // Retrieve or generate Visitor ID
  let visitorId = localStorage.getItem('portfolio_visitor_id');
  if (!visitorId) {
    visitorId = generateId('visitor');
    localStorage.setItem('portfolio_visitor_id', visitorId);
  }

  // Retrieve or generate Session ID
  let sessionId = sessionStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    sessionId = generateId('session');
    sessionStorage.setItem('portfolio_session_id', sessionId);
    
    // Create new session document in Firestore
    const docRef = doc(db, 'analyticsSessions', sessionId);
    sessionStartTime = Date.now();
    
    setDoc(docRef, {
      sessionId,
      visitorId,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      duration: 0,
      scrollDepth: 0,
      sectionsVisited: {},
      resumeDownloads: 0,
      projectClicks: {},
      serviceClicks: {},
      contactClicks: 0,
      aiOpens: 0,
      aiMessages: 0,
      totalClicks: 0,
      userAgent: navigator.userAgent || 'Unknown',
      platform: navigator.platform || 'Unknown'
    }).catch(err => {
      console.warn('Failed to initialize analytics session in Firestore:', err);
    });
  } else {
    currentSessionId = sessionId;
    sessionStartTime = Date.now(); // local start offset
  }

  currentSessionId = sessionId;

  // Set up periodic duration updates
  const durationInterval = setInterval(() => {
    updateSessionDuration();
  }, 15000); // every 15s

  // Set up scroll depth listener
  const scrollListener = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const depthPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
    
    // Track in 25% increments
    let milestone = 0;
    if (depthPercent >= 100) milestone = 100;
    else if (depthPercent >= 75) milestone = 75;
    else if (depthPercent >= 50) milestone = 50;
    else if (depthPercent >= 25) milestone = 25;

    if (milestone > maxScrollDepth) {
      maxScrollDepth = milestone;
      trackScroll(milestone);
    }
  };

  window.addEventListener('scroll', scrollListener, { passive: true });

  // General click listener to track engagement
  const clickListener = () => {
    incrementField('totalClicks');
  };
  window.addEventListener('click', clickListener, { passive: true });

  // Cleanup
  return () => {
    clearInterval(durationInterval);
    window.removeEventListener('scroll', scrollListener);
    window.removeEventListener('click', clickListener);
  };
}

async function updateSessionDuration() {
  if (!db || !currentSessionId || !sessionStartTime) return;
  const elapsed = Math.round((Date.now() - sessionStartTime) / 1000);
  try {
    const docRef = doc(db, 'analyticsSessions', currentSessionId);
    await updateDoc(docRef, {
      updatedAt: Date.now(),
      duration: elapsed
    });
  } catch {
    // Silent fail
  }
}

// Low-level helper to increment a count in session doc
async function incrementField(fieldName, value = 1) {
  if (!db || !currentSessionId) return;
  try {
    const docRef = doc(db, 'analyticsSessions', currentSessionId);
    await updateDoc(docRef, {
      [fieldName]: increment(value)
    });
  } catch (err) {
    console.warn(`Analytics increment error on field ${fieldName}:`, err);
  }
}

// Low-level helper to increment key in nested object
async function incrementMapKey(fieldName, key) {
  if (!db || !currentSessionId || !key) return;
  const safeKey = key.replace(/[.#$[\]]/g, '_'); // sanitize key
  try {
    const docRef = doc(db, 'analyticsSessions', currentSessionId);
    await updateDoc(docRef, {
      [`${fieldName}.${safeKey}`]: increment(1)
    });
  } catch (err) {
    console.warn(`Analytics increment map error on ${fieldName}.${safeKey}:`, err);
  }
}

// Track Section view
export function trackSectionView(sectionName) {
  if (!sectionName) return;
  incrementMapKey('sectionsVisited', sectionName);
}

// Track Project Click
export function trackProjectClick(projectId) {
  if (!projectId) return;
  incrementMapKey('projectClicks', projectId);
}

// Track Service Click
export function trackServiceClick(serviceTitle) {
  if (!serviceTitle) return;
  incrementMapKey('serviceClicks', serviceTitle);
}

// Track Scroll Depth
export function trackScroll(depth) {
  if (!db || !currentSessionId) return;
  try {
    const docRef = doc(db, 'analyticsSessions', currentSessionId);
    updateDoc(docRef, {
      scrollDepth: depth
    });
  } catch (err) {
    console.warn('Failed tracking scroll depth:', err);
  }
}

// Track Resume Download
export async function recordResumeDownload() {
  trackResumeDownload();
  if (!db) return;
  try {
    const resumeRef = doc(db, 'resume', 'singleton');
    await updateDoc(resumeRef, {
      downloadCount: increment(1)
    });
  } catch (err) {
    try {
      await setDoc(doc(db, 'resume', 'singleton'), {
        downloadCount: increment(1)
      }, { merge: true });
    } catch (e) {
      console.warn('Could not record resume download telemetry:', e);
    }
  }
}

export function trackResumeDownload() {
  incrementField('resumeDownloads');
  // Log notification to firestore
  logNotification('Resume Downloaded', 'A visitor downloaded Muhammad Usman\'s PDF Resume.', 'resume');
}

// Track Contact Button Clicks
export function trackContactSubmit() {
  incrementField('contactClicks');
}

// Track AI Opens
export function trackAIOpen() {
  incrementField('aiOpens');
  // Send notification for new AI conversation if it's the first time in this session
  const alreadyOpened = sessionStorage.getItem('portfolio_ai_opened');
  if (!alreadyOpened) {
    sessionStorage.setItem('portfolio_ai_opened', 'true');
    logNotification('New AI Chat Initiated', 'A visitor started an interactive conversation with the AI Assistant.', 'ai');
  }
}

// Track AI Messages
export function trackAIMessage() {
  incrementField('aiMessages');
}

// Log real-time notifications to Firestore
export async function logNotification(title, message, type) {
  if (!db) return;
  try {
    const notifId = `notif-${Date.now()}`;
    await setDoc(doc(db, 'adminNotifications', notifId), {
      id: notifId,
      title,
      message,
      type, // 'contact' | 'ai' | 'resume' | 'upload_failure' | 'firestore_error'
      read: false,
      createdAt: Date.now(),
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    });
  } catch (err) {
    console.warn('Failed logging notification to Firestore:', err);
  }
}
