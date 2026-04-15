import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRight } from "@fortawesome/free-solid-svg-icons";

function HeroSection({
  title,
  highlightedWord,
  subtitle,
  badgeText,
  badgeIcon = faStar,
  stats = [],
  showSearch = true,
  searchPlaceholder = "Job title, keywords, or company",
  locationPlaceholder = "City, state, or remote",
  searchValue = "",
  onSearchChange,
  locationValue = "",
  onLocationChange,
  onSearch,
  children,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // Career-related icons as simple shapes
    const drawBriefcase = (x, y, size) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - size / 2, y - size / 3, size, size / 1.5);
      ctx.beginPath();
      ctx.arc(x, y - size / 3, size / 4, 0, Math.PI, true);
      ctx.stroke();
    };

    const drawBuilding = (x, y, size) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      // Windows
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(x - size / 4, y - size / 4, size / 5, size / 5);
      ctx.fillRect(x + size / 8, y - size / 4, size / 5, size / 5);
      ctx.fillRect(x - size / 4, y + size / 8, size / 5, size / 5);
      ctx.fillRect(x + size / 8, y + size / 8, size / 5, size / 5);
    };

    const drawUser = (x, y, size) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y - size / 4, size / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawStar = (x, y, size) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = ((i * 72 - 90) * Math.PI) / 180;
        const x1 = x + Math.cos(angle) * size;
        const y1 = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawDocument = (x, y, size) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - size / 2, y - size / 2, size / 1.5, size);
      ctx.beginPath();
      ctx.moveTo(x + size / 4, y - size / 2);
      ctx.lineTo(x + size / 4, y - size / 4);
      ctx.lineTo(x + size / 2, y - size / 4);
      ctx.stroke();
    };

    const iconTypes = [
      drawBriefcase,
      drawBuilding,
      drawUser,
      drawStar,
      drawDocument,
    ];

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 25000);
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 20 + 15,
          type: Math.floor(Math.random() * iconTypes.length),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Wrap around edges smoothly
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Save context for rotation
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        // Draw the icon
        iconTypes[particle.type](0, 0, particle.size);

        ctx.restore();

        // Draw career path connections between similar icons
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.15;

            // Only connect certain icons to represent career paths
            const shouldConnect =
              (particle.type === 0 && otherParticle.type === 2) || // Briefcase to User
              (particle.type === 1 && otherParticle.type === 0) || // Building to Briefcase
              (particle.type === 2 && otherParticle.type === 4) || // User to Document
              (particle.type === 4 && otherParticle.type === 1) || // Document to Building
              (particle.type === 3 && otherParticle.type === 0) || // Star to Briefcase
              particle.type === particle.type; // Same types connect

            if (shouldConnect) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);

              // Dashed line for career paths
              ctx.setLineDash([5, 5]);
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
      {/* Career Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />

      {/* Subtle gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-900/20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          {badgeText && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-8 border border-white/30 animate-fade-in">
              <FontAwesomeIcon
                icon={badgeIcon}
                className="text-yellow-300 text-sm"
              />
              <span className="text-sm font-medium">{badgeText}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-slide-up">
            {title}{" "}
            {highlightedWord && (
              <span className="relative inline-block">
                {highlightedWord}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q50,10 100,5"
                    stroke="#FCD34D"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-200">
              {subtitle}
            </p>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 max-w-4xl mx-auto animate-slide-up animation-delay-400">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 rotate-[-45deg]"
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={onSearchChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-secondary-900 placeholder-secondary-400"
                  />
                </div>
                <div className="flex-1 relative">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                  />
                  <input
                    type="text"
                    placeholder={locationPlaceholder}
                    value={locationValue}
                    onChange={onLocationChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-secondary-900 placeholder-secondary-400"
                  />
                </div>
                <button
                  onClick={onSearch}
                  className="bg-white text-primary-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Search</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex justify-center gap-8 md:gap-12 mt-8 animate-fade-in animation-delay-600">
              {stats.map((stat, index) => (
                <React.Fragment key={index}>
                  <div className="text-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl md:text-4xl font-bold">
                      {stat.value}
                    </div>
                    <div className="text-primary-100 text-sm md:text-base font-medium">
                      {stat.label}
                    </div>
                  </div>
                  {index < stats.length - 1 && (
                    <div className="hidden sm:block w-px bg-white/30"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Additional Content */}
          {children}
        </div>
      </div>

      {/* Wave Shape */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            fill="#F9FAFB"
          />
        </svg>
      </div>
    </div>
  );
}

export default HeroSection;
