import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import chandVideo from "@/assets/chand.mp4";

const VideoIntro = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  const handleVideoEnd = () => {
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover md:object-contain"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={chandVideo} type="" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoIntro;
