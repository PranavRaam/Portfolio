import { Sparkles } from 'lucide-react';
import TextSection from './TextSection';

const sections = [
  {
    title: "WE CREATE",
    subtitle: "IMMERSIVE DIGITAL EXPERIENCES",
    titleColor: "text-red-600",
    subtitleColor: "text-white"
  },
  {
    title: "WE DELIVER",
    subtitle: "CUTTING-EDGE SOLUTIONS",
    titleColor: "text-white",
    subtitleColor: "text-red-600"
  },
  {
    title: "WE PUSH",
    subtitle: "CREATIVE BOUNDARIES",
    titleColor: "text-red-600",
    subtitleColor: "text-white"
  },
  {
    title: "WE BUILD",
    subtitle: "THE FUTURE OF WEB",
    titleColor: "text-white",
    subtitleColor: "text-red-600"
  }
];

const AnimatedSections = () => {
  return (
    <div className="space-y-[50vh] px-8 py-32 relative">
      <FloatingParticles />
      {sections.map((section, index) => (
        <TextSection key={index} {...section} />
      ))}
    </div>
  );
};

const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <Sparkles
        key={i}
        className="absolute text-red-600/30"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `scale(${Math.random() * 2 + 1})`,
          animation: `float ${Math.random() * 5 + 5}s infinite`
        }}
      />
    ))}
  </div>
);

export default AnimatedSections;