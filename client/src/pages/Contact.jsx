import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSent(false);

    // Validate form data
    if (!formData.user_name.trim() || !formData.user_email.trim() || !formData.message.trim()) {
      toast.error("Please fill out all fields!");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      toast.error("Please enter a valid email address!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Email sent successfully:", result.message);
        toast.success("Message sent successfully!");
        setIsSent(true);
        setFormData({ user_name: "", user_email: "", message: "" });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Email send failed:", error);
      toast.error(error.message || "Failed to send message. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#EB662B] py-16 px-4 text-white rounded-md">
      <motion.div
        className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-8 md:p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[#EB662B]">
          Contact Us
        </h2>
        <p className="text-center mb-8">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you shortly.
        </p>
        <form onSubmit={sendEmail} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Your Name</label>
            <input
              type="text"
              name="user_name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC]"
              placeholder="Enter your name"
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Your Email</label>
            <input
              type="email"
              name="user_email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC]"
              placeholder="Enter your email"
              value={formData.user_email}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Your Message
            </label>
            <textarea
              name="message"
              rows="5"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC]"
              placeholder="Enter your message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>
          </div>
          <div className="text-center">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              className="bg-[#EB662B] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#d15525] transition disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </motion.button>
            {isSent && (
              <p className="text-green-600 font-medium mt-3">
                Message sent successfully!
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;