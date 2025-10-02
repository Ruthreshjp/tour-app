// Using public directory paths instead of asset imports
import { motion } from "framer-motion";
import { Image } from '../../components/Image';

const Services = () => {
  const services = [
    {
      id: 1,
      image: "/images/weather.png",
      title: "Calculated Weather",
      description:
        "Built Wicket longer admire do barton vanity itself do in it.",
    },
    {
      id: 2,
      image: "/images/plane.png",
      title: "Best Flights ",
      description:
        "Engrossed listening. Park gate sell they west hard for the.",
    },
    {
      id: 3,
      image: "/images/event.png",
      title: "Local Events",
      description:
        "Barton vanity itself do in it. Preferd to men it engrossed listening. ",
    },
    {
      id: 4,
      image: "/images/setting.png",
      title: "Customization",
      description:
        "We deliver outsourced aviation services for military customers",
    },
  ];

  return (
    <div className="w-full py-6">
      <div className="max-w-[1080px] w-[90%] mx-auto">
        <h1 className="text-center text-gray-700 text-xl font-semibold">
          CATEGORY
        </h1>

        <div className="my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-center justify-center">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="max-w-[267px] h-[314px] w-full mx-auto flex flex-col items-center justify-center gap-3 shadow-md hover:bg-pink-100 cursor-pointer duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            >
              <Image src={service.image} className="w-16 h-16" alt="" />
              <h4 className="text-lg font-semibold">{service.title}</h4>
              <p className="max-w-[200px] w-full mx-auto text-sm text-center">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;