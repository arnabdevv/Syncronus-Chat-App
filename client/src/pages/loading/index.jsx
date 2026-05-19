import React from "react";

const Loading = () => {
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-electric-violet/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-deep-indigo/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Spinner */}
      <div className="flex flex-col items-center gap-6 z-10 relative glass-panel p-10 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="w-16 h-16 border-4 border-electric-violet/30 border-t-electric-violet rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
        <h3 className="text-xl font-medium text-white tracking-wider animate-pulse">
          Loading<span className="text-electric-violet">...</span>
        </h3>
      </div>
    </div>
  );
};

export default Loading;
