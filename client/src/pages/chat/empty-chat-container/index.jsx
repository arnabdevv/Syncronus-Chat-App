import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-transparent md:flex flex-col justify-center items-center hidden duration-1000 transition-all z-10">
      <Lottie
        isClickToPauseDisabled={true}
        height={200}
        width={200}
        options={animationDefaultOptions}
      />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h3 className="poppins-medium">
          Hii <span className="text-electric-violet">!</span> Welcome To
          <span className="text-electric-violet"> Syncronus </span>Chat App
          <span className="text-electric-violet">.</span>
        </h3>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
