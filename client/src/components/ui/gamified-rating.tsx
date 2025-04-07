import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GamifiedRatingProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  onComplete: () => void;
}

const GamifiedRating: React.FC<GamifiedRatingProps> = ({
  initialRating = 5,
  onRatingChange,
  onComplete
}) => {
  const [rating, setRating] = useState(initialRating);
  const [submitted, setSubmitted] = useState(false);
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Calculate bonus points based on rating
  useEffect(() => {
    if (rating === 5) {
      setBonusPoints(50);
    } else if (rating === 4) {
      setBonusPoints(30);
    } else if (rating === 3) {
      setBonusPoints(15);
    } else {
      setBonusPoints(5);
    }
  }, [rating]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onRatingChange(newRating);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowBonusAnimation(true);
    
    // Progress through animation steps
    const animationTimer = setInterval(() => {
      setAnimationStep(prev => {
        const next = prev + 1;
        if (next >= 3) {
          clearInterval(animationTimer);
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
        return next;
      });
    }, 1000);
    
    return () => clearInterval(animationTimer);
  };

  return (
    <div className="relative">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold">Rate Your Experience</h3>
          <p className="text-gray-500 text-sm">Help improve ride quality for everyone</p>
        </div>
        
        <div className="flex justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => !submitted && handleRatingChange(star)}
              disabled={submitted}
              className={`p-2 mx-1 rounded-full transition-all duration-200 ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <Star 
                className={`h-10 w-10 ${
                  star <= rating 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            </motion.button>
          ))}
        </div>
        
        <div className="text-center">
          <div className="mb-2">
            {rating === 5 && (
              <p className="text-green-500 font-medium flex items-center justify-center">
                <Award className="w-5 h-5 mr-1" />
                Excellent! You're making a driver's day!
              </p>
            )}
            {rating === 4 && (
              <p className="text-blue-500 font-medium flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-1" />
                Great ride! Thanks for the feedback!
              </p>
            )}
            {rating === 3 && (
              <p className="text-orange-500 font-medium">
                Good ride with room for improvement
              </p>
            )}
            {rating <= 2 && (
              <p className="text-red-500 font-medium">
                We're sorry about your experience
              </p>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={submitted}
            className={`bg-primary text-white py-3 px-8 rounded-xl font-semibold shadow-lg ${
              submitted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitted ? 'Submitted!' : 'Submit Rating'}
          </motion.button>
        </div>
      </div>
      
      {/* Bonus Points Animation */}
      <AnimatePresence>
        {showBonusAnimation && (
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {animationStep === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center"
              >
                <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-300">Your feedback helps improve our service</p>
              </motion.div>
            )}
            
            {animationStep === 1 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center"
              >
                <div className="bg-yellow-400/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-14 w-14 text-yellow-400" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">Bonus Points!</h3>
                <p className="text-gray-300">You've earned bonus points for rating</p>
              </motion.div>
            )}
            
            {animationStep === 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-4">
                  <div className="text-6xl font-bold text-yellow-400">+{bonusPoints}</div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white"
                  >
                    POINTS
                  </motion.div>
                </div>
                <p className="text-gray-300">Keep rating to earn more rewards!</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamifiedRating;