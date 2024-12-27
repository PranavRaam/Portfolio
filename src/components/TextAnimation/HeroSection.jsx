const HeroSection = () => {
    return (
      <div className="h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        <h1 className="split-text text-9xl md:text-[12rem] font-black tracking-tighter text-center mix-blend-difference">
          DIGITAL
          <br />
          EVOLUTION
        </h1>
      </div>
    );
  };
  
  export default HeroSection;