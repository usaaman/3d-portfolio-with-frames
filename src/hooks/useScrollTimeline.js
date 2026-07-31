import { useState, useEffect, useRef } from 'react';

export default function useScrollTimeline(wrapperRef, numSlots) {
  const [currentProject, setCurrentProject] = useState(0);

  const timelineRefs = useRef({
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
      let currentProj = Math.floor(scaledProgress);
      if (currentProj >= numSlots) currentProj = numSlots - 1;
      if (currentProj < 0) currentProj = 0;

      let localProgress = scaledProgress - currentProj;
      localProgress = Math.min(1.0, Math.max(0.0, localProgress));

      const nextProj = currentProj < numSlots - 1 ? currentProj + 1 : null;

      // Update ref values directly (synchronous, no re-render)
      timelineRefs.current.currentProject = currentProj;
      timelineRefs.current.nextProject = nextProj;
      timelineRefs.current.localProgress = localProgress;
      timelineRefs.current.globalProgress = globalProgress;

      // Only trigger React state update if the project index changed
      setCurrentProject((prev) => {
        if (prev !== currentProj) {
          return currentProj;
        }
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [wrapperRef, numSlots]);

  return { currentProject, timelineRefs };
}
