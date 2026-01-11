const Doubt = require('../models/Doubt.model');
const Session = require('../models/Session.model');
const { findSimilarDoubts, extractTopic } = require('../utils/nlp.utils');
const mongoose = require('mongoose');

class DoubtController {
  // Submit a new doubt
  async submitDoubt(req, res) {
    try {
      const { sessionId, question, studentId, studentName, isAnonymous, confusionLevel } = req.body;

      console.log('📝 Submitting doubt:', { sessionId, question, studentName });

      // Convert sessionId to ObjectId if it's a 6-character code
      let actualSessionId = sessionId;
      if (sessionId.length === 6) {
        const allSessions = await Session.find({ isActive: true });
        const session = allSessions.find(s => 
          s._id.toString().slice(-6).toUpperCase() === sessionId.toUpperCase()
        );
        if (!session) {
          return res.status(400).json({ error: 'Session not found' });
        }
        actualSessionId = session._id;
      }

      // Validate session
      const session = await Session.findById(actualSessionId);
      if (!session || !session.isActive) {
        return res.status(400).json({ error: 'Invalid or inactive session' });
      }

      // Extract topic using simple NLP
      const topic = extractTopic(question);

      // Create new doubt
      const doubt = new Doubt({
        sessionId: actualSessionId,
        question,
        studentId,
        studentName: isAnonymous ? 'Anonymous' : studentName,
        isAnonymous,
        topic,
        confusionLevel: confusionLevel || 1,
        mergedStudents: [{
          studentId,
          studentName: isAnonymous ? 'Anonymous' : studentName,
          timestamp: new Date()
        }]
      });

      // Auto-merge if enabled
      if (session.settings.autoMergeDoubts) {
        const similarDoubts = await findSimilarDoubts(actualSessionId, question);
        
        if (similarDoubts.length > 0) {
          const mainDoubt = similarDoubts[0];
          mainDoubt.mergedCount += 1;
          mainDoubt.mergedStudents.push({
            studentId,
            studentName: isAnonymous ? 'Anonymous' : studentName,
            timestamp: new Date()
          });
          await mainDoubt.save();

          doubt.mergedWith = mainDoubt._id;
          await doubt.save();

          // Emit real-time update
          console.log('🔥 Emitting doubt-merged to session:', actualSessionId.toString());
          req.io.to(actualSessionId.toString()).emit('doubt-merged', {
            doubt: mainDoubt,
            mergedCount: mainDoubt.mergedCount
          });

          return res.status(201).json({
            success: true,
            doubt: mainDoubt,
            merged: true
          });
        }
      }

      await doubt.save();

      // Update session stats
      session.stats.totalDoubts += 1;
      await session.save();

      // Emit real-time update
      console.log('📤 Emitting new-doubt to session:', actualSessionId.toString());
      req.io.to(actualSessionId.toString()).emit('new-doubt', doubt);

      res.status(201).json({
        success: true,
        doubt,
        merged: false
      });
    } catch (error) {
      console.error('❌ Error submitting doubt:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all doubts for a session
  async getDoubts(req, res) {
    try {
      let { sessionId } = req.params;
      const { answered, topic } = req.query;

      // Convert 6-character code to ObjectId
      if (sessionId.length === 6) {
        const allSessions = await Session.find({ isActive: true });
        const session = allSessions.find(s => 
          s._id.toString().slice(-6).toUpperCase() === sessionId.toUpperCase()
        );
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        sessionId = session._id;
      }

      const query = { sessionId, mergedWith: null };
      
      if (answered !== undefined) {
        query.isAnswered = answered === 'true';
      }
      
      if (topic) {
        query.topic = topic;
      }

      const doubts = await Doubt.find(query)
        .sort({ mergedCount: -1, createdAt: -1 });

      res.json({
        success: true,
        doubts,
        count: doubts.length
      });
    } catch (error) {
      console.error('❌ Error fetching doubts:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Mark doubt as answered
  async markAnswered(req, res) {
    try {
      const { id } = req.params;
      const { answer } = req.body;

      const doubt = await Doubt.findById(id);
      if (!doubt) {
        return res.status(404).json({ error: 'Doubt not found' });
      }

      doubt.isAnswered = true;
      doubt.answeredAt = new Date();
      if (answer) {
        doubt.answer = answer;
      }
      await doubt.save();

      // Update session stats
      await Session.findByIdAndUpdate(doubt.sessionId, {
        $inc: { 'stats.answeredDoubts': 1 }
      });

      // Emit real-time update
      console.log('✅ Emitting doubt-answered to session:', doubt.sessionId.toString());
      req.io.to(doubt.sessionId.toString()).emit('doubt-answered', doubt);

      res.json({
        success: true,
        doubt
      });
    } catch (error) {
      console.error('❌ Error marking doubt as answered:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Upvote a doubt
  async upvoteDoubt(req, res) {
    try {
      const { id } = req.params;
      const { studentId } = req.body;

      const doubt = await Doubt.findById(id);
      if (!doubt) {
        return res.status(404).json({ error: 'Doubt not found' });
      }

      // Toggle upvote
      const hasUpvoted = doubt.upvotedBy.includes(studentId);
      if (hasUpvoted) {
        doubt.upvotes -= 1;
        doubt.upvotedBy = doubt.upvotedBy.filter(id => id !== studentId);
      } else {
        doubt.upvotes += 1;
        doubt.upvotedBy.push(studentId);
      }

      await doubt.save();

      // Emit real-time update
      req.io.to(doubt.sessionId.toString()).emit('doubt-upvoted', doubt);

      res.json({
        success: true,
        doubt
      });
    } catch (error) {
      console.error('❌ Error upvoting doubt:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DoubtController();
