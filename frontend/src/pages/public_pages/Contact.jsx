import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faPaperPlane,
  faCheckCircle,
  faUser,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { contact } from "../../data/contact";
import FAQ from "../../data/Faq";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const contactInfo = contact[0];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-primary-100">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-primary-600 text-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Visit Us
              </h3>
              <p className="text-secondary-600 leading-relaxed">
                {contactInfo.address}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-primary-600 text-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Email Us
              </h3>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-primary-600 hover:text-primary-700 block"
              >
                {contactInfo.email}
              </a>
              <p className="text-secondary-500 text-sm mt-2">
                We'll respond within 24 hours
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-primary-600 text-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Call Us
              </h3>
              <a
                href={`tel:${contactInfo.phone}`}
                className="text-primary-600 hover:text-primary-700 text-lg font-semibold block"
              >
                {contactInfo.phone}
              </a>
              <p className="text-secondary-500 text-sm mt-2">
                Mon-Fri, 9am-6pm
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-primary-600 text-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Office Hours
              </h3>
              <div className="space-y-2">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-secondary-600">{schedule.day}</span>
                    <span className="text-secondary-500">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-all group"
                >
                  <FontAwesomeIcon
                    icon={faFacebook}
                    className="text-primary-600 group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-all group"
                >
                  <FontAwesomeIcon
                    icon={faTwitter}
                    className="text-primary-600 group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-all group"
                >
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    className="text-primary-600 group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-all group"
                >
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className="text-primary-600 group-hover:scale-110 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-secondary-500">
                  Fill out the form below and we'll get back to you shortly
                </p>
              </div>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fadeIn">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 text-xl"
                  />
                  <p className="text-green-700">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-secondary-700 font-medium mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-secondary-700 font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="abc@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                    />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faComment}
                      className="absolute left-3 top-3 text-secondary-400"
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 md:mt-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-96 w-full bg-secondary-100 relative">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/dir/Amrood+Labs+(Pvt)+LTD,+283-B2,+Block+B+2+Phase+1+Johar+Town,+Lahore,+54000,+Pakistan//@31.4573291,74.2997465,17.56z/data=!4m8!4m7!1m5!1m1!1s0x39190128e778da0d:0xd3f4231a85eda17e!2m2!1d74.2982893!2d31.4635157!1m0?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
            <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-primary-600 text-xl"
                />
                <div>
                  <p className="text-secondary-600">{contactInfo.address}</p>
                  <p className="text-sm text-secondary-500 mt-1">
                    Located in the heart of the city, easily accessible by
                    public transport
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-secondary-500">
              Find quick answers to common questions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-secondary-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-secondary-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
