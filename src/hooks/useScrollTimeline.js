import { useState, useEffect } from 'react';

export default function useScrollTimeline(wrapperRef, numSlots) {
  const [timeline, setTimeline] = useState({
    currentProject: 0,
    nextProject: 1,
    localProgress: 0,
    globalProgress: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const scrollY = -rect.top;
      const totalScroll = rect.height - window.innerHeight;

      // Calculate globalProgress (0 to 1)
      let globalProgress = 0;
      if (totalScroll > 0) {
        globalProgress = Math.min(1.0, Math.max(0.0, scrollY / totalScroll));
      }

      // Calculate local progresses
      const scaledProgress = globalProgress * numSlots;
      let currentProject = Math.floor(scaledProgress);
      if (currentProject >= numSlots) currentProject = numSlots - 1;
      if (currentProject < 0) currentProject = 0;

      let localProgress = scaledProgress - currentProject;
      localProgress = Math.min(1.0, Math.max(0.0, localProgress));

      const nextProject = currentProject < numSlots - 1 ? currentProject + 1 : null;

      setTimeline({
        currentProject,
        nextProject,
        localProgress,
        globalProgress,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [wrapperRef, numSlots]);

  return timeline;
}
