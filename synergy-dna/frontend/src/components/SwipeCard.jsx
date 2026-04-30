import { motion, useAnimation } from 'framer-motion';
import { X, Heart, MapPin, Building, Briefcase } from 'lucide-react';
import { useState } from 'react';

const SwipeCard = ({ job, onSwipe }) => {
  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      setExitX(1000);
      onSwipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-1000);
      onSwipe('left');
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleAction = (direction) => {
    if (direction === 'right') {
      setExitX(1000);
    } else {
      setExitX(-1000);
    }
    // slight delay to allow animation
    setTimeout(() => onSwipe(direction), 300);
  };

  return (
    <div className="card-container">
      <motion.div
        className="swipe-card"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0, opacity: 1 }}
        exit={{ x: exitX, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="card-header">
          <h2 className="company-name">{job.company_name}</h2>
          <h3 className="job-title">{job.job_title}</h3>
          
          <div className="job-meta">
            <span className="meta-pill"><MapPin size={16} /> {job.location}</span>
            <span className="meta-pill"><Building size={16} /> {job.industry}</span>
            <span className="meta-pill"><Briefcase size={16} /> {job.salary}</span>
          </div>
        </div>

        <div className="cis-score-container">
          <div>
            <div className="cis-label">Compatibility Index Score</div>
            <div className="cis-value">{job.compatibility_index_score}</div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-swipe btn-reject" 
            onClick={() => handleAction('left')}
            title="Reject"
          >
            <X size={32} />
          </button>
          <button 
            className="btn-swipe btn-accept" 
            onClick={() => handleAction('right')}
            title="Accept"
          >
            <Heart size={32} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeCard;
