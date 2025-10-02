// Using public directory paths instead of asset imports
import { motion } from "framer-motion";
import { Image } from '../../components/Image';
import { useState, useEffect } from "react";

const Booking = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // check on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
    {
      id: 1,
      image: "/images/destination.png",
      title: "Choose Destination",
      description:
        "Built Wicket longer admire do barton vanity itself do in it. ",
    },
    {
      id: 2,
      image: "/images/payment.png",
      title: "Make Payment",
      description: "just make your payment and enjoy the trip",
    },
    {
      id: 3,
      image: "/images/vehicle.png",
      title: "Reach AirPort on Selected Date",
      description: "Reach airport on selected date and enjoy your trip with us",
    },
  ];

  return (
    <div className="w-full my-16">
      <div className="max-w-[1080px] w-[90%] mx-auto">
        {/* Animated Heading */}
        <motion.h4
          className="text-[#DF6951] text-center md:text-start text-lg font-semibold md:text-xl md:font-bold"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Easy and Fast
        </motion.h4>

        <motion.h1
          className="text-[#181E4B] text-center md:text-start text-5xl font-bold my-4 capitalize"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Book your next trip in <br /> 3 easy steps
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-10 items-center">
          {/* Left Steps Section */}
          <div className="w-full md:w-1/2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex gap-8 my-2 py-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image src={step.image} alt="" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[#5E6282] text-lg font-semibold md:text-xl md:font-bold">
                    {step.title}
                  </h2>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Image Card */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1.1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="max-w-[370px] w-full mx-auto h-[300px] bg-white rounded-md flex flex-col items-center px-3">
              <motion.img
                src="/images/booking_right.jpg"
                className="transition-transform hover:scale-105 duration-300 ease-in-out"
                alt=""
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              />
              <h1 className="text-gray-800 my-4 text-lg font-semibold md:text-xl md:font-bold">
                Trip To Goa
              </h1>
              <div className="flex items-center justify-around gap-3 text-sm text-gray-600">
                <p>30 September</p> |<p>Trip to Goa</p>
              </div>
              <div className="flex items-center justify-around gap-5 my-3 text-sm text-gray-700 font-medium">
                <p>24 people going</p>
                <p>Rs. 2,500</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* logo section */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-16">
          {["/images/logo1.png", "/images/logo2.png", "/images/logo3.png", "/images/logo4.png", "/images/logo5.png"].map((logo, index) =>
            isMobile ? (
              // No animation on mobile
              <img key={index} src={logo} alt="" className="max-w-[120px] w-full object-contain" />
            ) : (
              // Animated on md and up
              <motion.img
                key={index}
                src={logo}
                alt=""
                className="max-w-[120px] w-full object-contain"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;