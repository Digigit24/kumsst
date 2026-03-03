import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import appLogo from '../assets/app_logo-removebg-preview.png';
import kumssLogo from '../assets/kumss_logo.png';
// TODO: Replace with actual left.webp and right.png images
import leftImage from '../assets/left.webp';
import rightImage from '../assets/right.png';

const INAUGURATION_SEEN_KEY = 'inauguraton_seen';

const InaugurationPage = () => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(true);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showPrompt) {
        startInauguration();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPrompt]);

  const startInauguration = () => {
    setShowPrompt(false);

    // Open curtains
    setCurtainsOpen(true);

    // Start confetti after curtains start opening
    setTimeout(() => {
      setShowConfetti(true);
    }, 600);

    // Fade out before navigation (15 seconds display time)
    setTimeout(() => {
      setFadeOut(true);
    }, 15000);

    // Navigate to login after celebration (15 seconds display time)
    setTimeout(() => {
      localStorage.setItem(INAUGURATION_SEEN_KEY, 'true');
      // Use window.location for a full page reload to ensure InaugurationWrapper re-checks localStorage
      window.location.href = '/login';
    }, 15500);
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={300}
          gravity={0.25}
          colors={['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fbbf24', '#f59e0b']}
        />
      )}

      {/* Main Content - Behind curtains */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Left Inaugurator Image - No container, positioned from bottom */}
        <div className={`absolute left-12 md:left-12 bottom-0 transition-all duration-1000 ${
          curtainsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <img
            src={leftImage}
            alt="Left Inaugurator"
            className="w-auto h-[80vh] object-cover object-bottom scale-x-[-1]"
          />
          {/* Name and Designation Box - Glassmorphism */}
          <div className="absolute bottom-12 left-4 right-4 bg-black/50 backdrop-blur-md rounded-lg py-3 px-1 border border-white/20">
            <h3 className="text-white text-lg md:text-xl font-bold text-center mb-1 drop-shadow-lg leading-tight">
              मा. श्री. अजितदादा पवार साो
            </h3>
            <p className="text-yellow-300 text-sm md:text-base text-center font-semibold drop-shadow-lg leading-tight">
              उपमुख्यमंत्री ,अर्थ व नियोजन तथा राज्य उत्पादन शुल्क  मंत्री, महाराष्ट्र <br /> राज्य अध्यक्ष ,कृषि उद्योग मूल शिक्षण संस्था ,काऱ्हाटी. 
            </p>
          </div>
        </div>

        {/* Right Inaugurator Image - No container, positioned from bottom */}
        <div className={`absolute right-12 md:right-12 bottom-0 transition-all duration-1000 ${
          curtainsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <img
            src={rightImage}
            alt="Right Inaugurator"
            className="w-auto h-[80vh] object-cover object-bottom"
          />
          {/* Name and Designation Box - Glassmorphism */}
          <div className="absolute bottom-12 left-4 right-4 bg-black/50 backdrop-blur-md rounded-lg py-3 px-4 border border-white/20">
            <h3 className="text-white text-lg md:text-xl font-bold text-center mb-1 drop-shadow-lg leading-tight">
              मा. सौ. सुनेत्रा (वहिनीसाहेब) अजित पवार
            </h3>
            <p className="text-yellow-300 text-sm md:text-base text-center font-semibold drop-shadow-lg leading-tight">
              खासदार , राज्यसभा ,भारत सरकार <br /> विश्वस्त , कृषि उद्योग मूल शिक्षण संस्था , काऱ्हाटी. 
            </p>
          </div>
        </div>

        {/* Logos at the top - Aligned with person images top */}
        <div className={`absolute top-[10vh] left-0 right-0 flex gap-8 justify-center items-center transition-all duration-1000 ${
          curtainsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <img
            src={appLogo}
            alt="App Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
          />
          <img
            src={kumssLogo}
            alt="KUMSS Logo"
            className="w-24 h-24 md:w-32 md:h-32 "
          />
        </div>

        {/* Center Content - Below logos */}
        <div className={`text-center transition-all duration-1000 ${
          curtainsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-6">
            EduSphere
          </h1>

          <p className="text-xl md:text-2xl text-purple-600 font-medium italic max-w-3xl mx-auto px-4">
            "Empowering Education, Transforming Futures"
          </p>
        </div>

        {/* Success Message after curtains open */}
        {curtainsOpen && (
          <div className="absolute bottom-[22vh] left-0 right-0 text-center animate-fade-in">
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Welcome to the Future of Education Management
            </p>
          </div>
        )}
      </div>

      {/* Curtain Rod */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-yellow-700 to-yellow-800 z-30 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />
        {/* Rod ends */}
        <div className="absolute -left-2 top-0 w-8 h-6 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full shadow-xl" />
        <div className="absolute -right-2 top-0 w-8 h-6 bg-gradient-to-bl from-yellow-600 to-yellow-800 rounded-full shadow-xl" />
      </div>

      {/* Left Curtain - Realistic Red Curtain */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 transform origin-left z-20 ${
          curtainsOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: curtainsOpen ? 'none' : '15px 0 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Main curtain fabric with pleats */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-800 via-red-700 to-red-800 overflow-hidden">
          {/* Vertical pleats/folds */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{
                left: `${i * 8.33}%`,
                width: '8.33%',
                background: i % 2 === 0
                  ? 'linear-gradient(to right, rgba(139, 0, 0, 0.6), rgba(178, 34, 34, 0.3), rgba(139, 0, 0, 0.6))'
                  : 'linear-gradient(to right, rgba(178, 34, 34, 0.3), rgba(220, 20, 60, 0.4), rgba(178, 34, 34, 0.3))',
                boxShadow: i % 2 === 0
                  ? 'inset 2px 0 4px rgba(0, 0, 0, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.3)'
                  : 'inset 2px 0 6px rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}

          {/* Velvet texture overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            }}
          />

          {/* Shine effect for silk/velvet look */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

          {/* Edge shadow */}
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-black/40 to-transparent" />
        </div>

        {/* Curtain rings/hooks at top */}
        <div className="absolute top-0 left-0 right-0 h-8 flex justify-around items-center">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full shadow-md border border-yellow-900" />
          ))}
        </div>
      </div>

      {/* Right Curtain - Realistic Red Curtain */}
      <div
        className={`absolute top-0 right-0 h-full w-1/2 transform origin-right z-20 ${
          curtainsOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: curtainsOpen ? 'none' : '-15px 0 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Main curtain fabric with pleats */}
        <div className="absolute inset-0 bg-gradient-to-l from-red-800 via-red-700 to-red-800 overflow-hidden">
          {/* Vertical pleats/folds */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{
                left: `${i * 8.33}%`,
                width: '8.33%',
                background: i % 2 === 0
                  ? 'linear-gradient(to right, rgba(139, 0, 0, 0.6), rgba(178, 34, 34, 0.3), rgba(139, 0, 0, 0.6))'
                  : 'linear-gradient(to right, rgba(178, 34, 34, 0.3), rgba(220, 20, 60, 0.4), rgba(178, 34, 34, 0.3))',
                boxShadow: i % 2 === 0
                  ? 'inset 2px 0 4px rgba(0, 0, 0, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.3)'
                  : 'inset 2px 0 6px rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}

          {/* Velvet texture overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            }}
          />

          {/* Shine effect for silk/velvet look */}
          <div className="absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-transparent" />

          {/* Edge shadow */}
          <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Curtain rings/hooks at top */}
        <div className="absolute top-0 left-0 right-0 h-8 flex justify-around items-center">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full shadow-md border border-yellow-900" />
          ))}
        </div>
      </div>

      {/* Prompt to Start - ABOVE curtains */}
      {showPrompt && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              GRAND OPENING
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              KUMSS EduSphere
            </p>
          </div>

          <button
            onClick={startInauguration}
            className="group relative px-10 py-4 bg-white text-red-700 font-semibold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Press Enter to Launch
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InaugurationPage;
