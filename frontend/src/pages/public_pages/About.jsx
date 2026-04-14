import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faUsers,
  faHandshake,
  faGlobe,
  faChartLine,
  faHeart,
  faBriefcase,
  faBuilding,
  faQuoteLeft,
  faArrowRight,
  faTrophy,
  faStar,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin as faLinkedinBrand,
  faTwitter as faTwitterBrand,
  faGithub as faGithubBrand,
} from "@fortawesome/free-brands-svg-icons";

// Import data from data folder
import jobsData from "../../data/Job";
import teamData from "../../data/team";
import companiesData from "../../data/companies";
import testimonialsData from "../../data/testimonials";
import milestonesData from "../../data/milestones";
import valuesData from "../../data/values";
import achievementsData from "../../data/achievements";

function About() {
  const [counts, setCounts] = useState({
    jobs: 0,
    companies: 0,
    seekers: 0,
    satisfaction: 0,
  });

  // Get total jobs and companies
  const totalJobs = jobsData.length;
  const totalCompanies = companiesData.length;
  const totalSeekers = 50000;
  const satisfactionRate = 98;

  // Animated counter effect
  useEffect(() => {
    const animateCount = (target, key) => {
      let start = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCounts((prev) => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounts((prev) => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 20);
    };

    animateCount(totalJobs * 1000, "jobs");
    animateCount(totalCompanies * 100, "companies");
    animateCount(totalSeekers, "seekers");
    animateCount(satisfactionRate, "satisfaction");
  }, [totalJobs, totalCompanies]);

  const stats = [
    {
      number: counts.jobs.toLocaleString(),
      label: "Jobs Posted",
      icon: faBriefcase,
      suffix: "+",
    },
    {
      number: counts.companies,
      label: "Companies",
      icon: faBuilding,
      suffix: "+",
    },
    {
      number: counts.seekers.toLocaleString(),
      label: "Job Seekers",
      icon: faUsers,
      suffix: "+",
    },
    {
      number: counts.satisfaction,
      label: "Satisfaction Rate",
      icon: faChartLine,
      suffix: "%",
    },
  ];

  // Map icon names to actual icons
  const getIcon = (iconName) => {
    const icons = {
      rocket: faRocket,
      handshake: faHandshake,
      users: faUsers,
      heart: faHeart,
      globe: faGlobe,
      building: faBuilding,
      "chart-line": faChartLine,
      trophy: faTrophy,
      star: faStar,
      "arrow-trend-up": faArrowTrendUp,
    };
    return icons[iconName] || faRocket;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section with Animated Background */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fadeInUp">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                Connecting Talent with Opportunity
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
                We're on a mission to transform the way people find jobs and
                companies find talent. Since 2020, we've helped thousands of
                professionals find their dream careers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with Animated Counters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon
                  icon={stat.icon}
                  className="text-primary-600 text-2xl"
                />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-secondary-900 mb-1">
                {stat.number}
                {stat.suffix}
              </div>
              <div className="text-sm text-secondary-500 group-hover:text-primary-600 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <FontAwesomeIcon
                  icon={faRocket}
                  className="text-primary-600 text-3xl"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
                Our Mission
              </h2>
              <p className="text-secondary-600 leading-relaxed text-lg">
                To empower individuals to find meaningful careers and help
                organizations build exceptional teams. We believe that everyone
                deserves to do work they love.
              </p>
            </div>
            <div className="group bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="text-accent-600 text-3xl"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
                Our Vision
              </h2>
              <p className="text-secondary-600 leading-relaxed text-lg">
                To become the world's most trusted job platform, connecting
                talent with opportunities across the globe. Making job search
                seamless and empowering.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values with Gradient Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            These principles guide everything we do
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valuesData.map((value, index) => (
            <div
              key={index}
              className={`group bg-gradient-to-br ${value.color} rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon
                  icon={getIcon(value.icon)}
                  className="text-white text-2xl"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Achievements
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Recognized for excellence in the industry
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievementsData.map((achievement, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={getIcon(achievement.icon)}
                    className="text-white text-xl"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {achievement.title}
                </h3>
                <p className="text-white/70 text-sm">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Timeline - Modern Design */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              The milestones that shaped our story
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 via-primary-400 to-primary-300 hidden md:block"></div>
            <div className="space-y-8">
              {milestonesData.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="flex-1 hidden md:block"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-white rounded-full z-10 shadow-xl border-4 border-primary-500 mx-4">
                    <FontAwesomeIcon
                      icon={getIcon(milestone.icon)}
                      className="text-primary-600 text-xl"
                    />
                  </div>
                  <div className="flex-1 w-full md:w-auto bg-gradient-to-r from-secondary-50 to-white rounded-2xl shadow-lg p-6 mt-4 md:mt-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-x-1">
                    <div className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-secondary-500">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section with Social Links */}
      <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              The passionate people behind JobPortal
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamData.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-2">
                      {member.social?.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faLinkedinBrand}
                            className="text-white text-sm"
                          />
                        </a>
                      )}
                      {member.social?.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faTwitterBrand}
                            className="text-white text-sm"
                          />
                        </a>
                      )}
                      {member.social?.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faGithubBrand}
                            className="text-white text-sm"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-secondary-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-secondary-500 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              What People Say
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Don't just take our word for it
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className="text-primary-400 text-2xl mb-4"
                />
                <p className="text-secondary-600 mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-secondary-500">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action with Animation */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of professionals who found their dream jobs through
            JobPortal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Find Your Dream Job
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
              Post a Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
