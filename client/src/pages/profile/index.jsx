import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      console.log(userInfo.image);
      setImage(`${HOST}/${userInfo.image}`);
      console.log(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is Required.");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is Required.");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
          firstName,
          lastName,
          colors: selectedColor,
        });
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Update Successfull");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please Setup profile.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    console.log({ file });
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData);
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Profile Image Updated");
      }
      // const reader = new FileReader();
      // reader.onload = () => {
      //   setImage(reader.result);
      // };
      // reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE);
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Image Removed Succeccfully.");
        setImage(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-background h-[100vh] flex items-center justify-center flex-col gap-10 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-electric-violet/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-deep-indigo/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col gap-10 w-[90vw] md:w-max glass-panel rounded-[2rem] p-10 z-10 relative">
        <div
          onClick={handleNavigate}
          className="flex items-center gap-3 cursor-pointer group w-max"
        >
          <IoArrowBack className="text-4xl text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white font-medium transition-colors">
            Back
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center mx-auto md:mx-0"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden neon-border">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl flex items-center justify-center rounded-full ${getColor(
                    selectedColor,
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full cursor-pointer transition-all duration-300"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden "
              onChange={handleImageChange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-black/20 border-white/10 text-neutral-400 cursor-not-allowed"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className="rounded-lg p-6 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg p-6 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet"
              />
            </div>
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                  ${
                    selectedColor === index
                      ? "ring-2 ring-white/80 scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      : "opacity-70 hover:opacity-100"
                  }}
                  `}
                  key={index}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full mt-4">
          <Button
            className="h-16 w-full rounded-xl bg-electric-violet hover:bg-deep-indigo text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-t border-white/20"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
