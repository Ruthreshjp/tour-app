import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import hero_image from "../../assets/images/hero_img.png";
import hero_image2 from "../../assets/images/hero_img2.png";
import hero_image3 from "../../assets/images/hero_img3.png";
import hero_image4 from "../../assets/images/hero_img4.png";
import hero_image5 from "../../assets/images/hero_img5.png";
import hero_image6 from "../../assets/images/hero_img6.png";

const HeroImage = () => {
  return (
    <div className="w-full my-6">
      <div className="max-w-[1080px] w-[90%] mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={true}
          className="w-full h-[400px] rounded-xl"
        >
          <SwiperSlide>
            <img
              src={hero_image}
              alt="Hero 1"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={hero_image4}
              alt="Hero 4"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={hero_image2}
              alt="Hero 2"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={hero_image6}
              alt="Hero 6"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={hero_image5}
              alt="Hero 5"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src={hero_image3}
              alt="Hero 3"
              className="w-full h-full object-cover rounded-xl"
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default HeroImage;