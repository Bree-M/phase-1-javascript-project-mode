import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WiCloud, WiDaySunny, WiStrongWind } from "react-icons/wi";
import { motion } from "framer-motion";

const AviationWeather = () => {
  const [background, setBackground] = useState("/images/flights-taking-off.jpg");

  useEffect(() => {
    const images = [
      "/images/flights-taking-off.jpg",
      "/images/flights-landing.jpg"
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length;
      setBackground(images[index]);
    }, 60000); // Switch every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex justify-center items-center h-screen bg-black text-white relative"
      style={{
        backgroundImage: `url('${background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1s ease-in-out"
      }}
    >
      <Card className="bg-opacity-20 backdrop-blur-lg border border-gray-500 w-[600px] p-4">
        <CardContent className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-3xl font-bold">Okinawa</div>
            <div className="text-sm text-gray-400">Japan</div>
            <div className="mt-4 flex justify-between">
              <div>
                <WiDaySunny className="text-5xl" />
                <div className="text-2xl">23°C</div>
              </div>
              <div>
                <WiStrongWind className="text-5xl" />
                <div className="text-xl">12 km/h</div>
              </div>
              <div>
                <WiCloud className="text-5xl" />
                <div className="text-xl">Few Clouds</div>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-300">
              Flight: HND → OKA | ETA: 15:20 | Altitude: 35,000 ft
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AviationWeather;

