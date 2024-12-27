const TextSection = ({ title, subtitle, titleColor, subtitleColor }) => {
    return (
      <div className="parallax-section max-w-7xl mx-auto">
        <div className="reveal-text">
          <h2 className={`text-6xl md:text-9xl font-black ${titleColor} mb-8`}>
            {title}
          </h2>
          <p className={`text-4xl md:text-7xl font-bold ${subtitleColor} leading-tight`}>
            {subtitle}
          </p>
        </div>
      </div>
    );
  };
  
  export default TextSection;