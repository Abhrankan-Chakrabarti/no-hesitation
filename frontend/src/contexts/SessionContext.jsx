import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.service';
import socketService from '../services/socket.service';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children, sessionId }) => {
  const [session, setSession] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [confusionStats, setConfusionStats] = useState({
    clear: 0,
    slight: 0,
    confused: 0,
    lost: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time event handlers
  const handleNewDoubt = useCallback((doubt) => {
    console.log('📨 Received new-doubt:', doubt);
    setDoubts(prev => {
      // Check if doubt already exists
      const exists = prev.some(d => d._id === doubt._id);
      if (exists) return prev;
      return [doubt, ...prev];
    });
  }, []);

  const handleDoubtMerged = useCallback(({ doubt }) => {
    console.log('🔥 Received doubt-merged:', doubt);
    setDoubts(prev => prev.map(d => 
      d._id === doubt._id ? doubt : d
    ));
  }, []);

  const handleDoubtAnswered = useCallback((doubt) => {
    console.log('✅ Received doubt-answered:', doubt);
    setDoubts(prev => prev.map(d => 
      d._id === doubt._id ? doubt : d
    ));
  }, []);

  const handleDoubtUpvoted = useCallback((doubt) => {
    console.log('👍 Received doubt-upvoted:', doubt);
    setDoubts(prev => prev.map(d => 
      d._id === doubt._id ? doubt : d
    ));
  }, []);

  const handleConfusionUpdated = useCallback((stats) => {
    console.log('📊 Received confusion-updated:', stats);
    setConfusionStats(stats);
  }, []);

  useEffect(() => {
    if (sessionId) {
      initializeSession();
    }

    return () => {
      cleanup();
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Initializing session:', sessionId);

      // Load session data
      const sessionData = await apiService.getSession(sessionId);
      setSession(sessionData.session);
      
      // Use the actual ObjectId for real-time
      const actualSessionId = sessionData.session._id;

      // Load doubts
      try {
        const doubtsData = await apiService.getDoubts(sessionId);
        setDoubts(doubtsData.doubts || []);
      } catch (err) {
        console.error('Error loading doubts:', err);
        setDoubts([]);
      }

      // Load confusion stats
      try {
        const statsData = await apiService.getConfusionStats(sessionId);
        setConfusionStats(statsData.stats || {
          clear: 0,
          slight: 0,
          confused: 0,
          lost: 0,
          total: 0
        });
      } catch (err) {
        console.error('Error loading stats:', err);
        setConfusionStats({
          clear: 0,
          slight: 0,
          confused: 0,
          lost: 0,
          total: 0
        });
      }
      
      // Setup real-time connection
      setupRealtimeListeners(actualSessionId);

    } catch (err) {
      console.error('Session initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = (actualSessionId) => {
    console.log('🎧 Setting up real-time listeners for session:', actualSessionId);
    
    // Connect socket
    socketService.connect();
    
    // Join session room
    socketService.joinSession(actualSessionId);
    
    // Register event listeners
    socketService.on('new-doubt', handleNewDoubt);
    socketService.on('doubt-merged', handleDoubtMerged);
    socketService.on('doubt-answered', handleDoubtAnswered);
    socketService.on('doubt-upvoted', handleDoubtUpvoted);
    socketService.on('confusion-updated', handleConfusionUpdated);
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up session context');
    
    // Remove event listeners
    socketService.off('new-doubt', handleNewDoubt);
    socketService.off('doubt-merged', handleDoubtMerged);
    socketService.off('doubt-answered', handleDoubtAnswered);
    socketService.off('doubt-upvoted', handleDoubtUpvoted);
    socketService.off('confusion-updated', handleConfusionUpdated);
    
    // Disconnect socket
    socketService.disconnect();
  };

  const refreshDoubts = useCallback(async () => {
    try {
      const doubtsData = await apiService.getDoubts(sessionId);
      setDoubts(doubtsData.doubts || []);
    } catch (err) {
      console.error('Error refreshing doubts:', err);
    }
  }, [sessionId]);

  const value = {
    session,
    doubts,
    confusionStats,
    loading,
    error,
    refreshDoubts
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
