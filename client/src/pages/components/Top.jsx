// Using public directory paths instead of asset imports
import { motion } from "framer-motion";

const Top = () => {
  const topSellings = [
    {
      id: 1,
      image: "/images/t1.jpg",
      destination: "Lahore",
      price: "Rs. 1k",
      duration: "10 days",
    },
    {
      id: 2,
      image: "/images/t2.jpg",
      destination: "Karachi",
      price: "Rs. 2k",
      duration: "5 days",
    },
    {
      id: 3,
      image: "/images/t3.jpg",
      destination: "Murree",
      price: "Rs. 3k",
      duration: "13 days",
    },
    {
      id: 4,
      image: "/images/t4.jpg",
      destination: "Islamabad",
      price: "Rs. 2.5k",
      duration: "13 days",
    },
  ];
  return (
    <div className="w-full">
      <div className="max-w-[1080px] w-[90%] mx-auto my-12">
        <h1 className="text-center text-gray-700 text-2xl font-semibold">
          Top Selling
        </h1>
        <h1 className="my-2 text-center text-gray-900 text-4xl font-bold">
          Top Destinations
        </h1>

        <div className="my-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-center">
          {topSellings.map((item, index) => (
            <motion.div
              key={item.id}
              className="mx-auto flex flex-col items-center justify-center rounded-lg cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            >
              <div className="w-full h-[350px] overflow-hidden rounded-lg">
                <motion.img
                  src={item.image}
                  className="w-full h-full object-cover"
                  alt={item.destination}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-around w-full mt-3">
                <h4 className="text-lg font-semibold text-gray-800">
                  {item.destination}
                </h4>
                <p className="text-lg font-bold text-primary">{item.price}</p>
              </div>

              <p className="text-sm text-gray-500 mb-3">{item.duration}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Top;