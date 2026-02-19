interface WaveDividerProps {
  className?: string;
  flip?: boolean;
}

export default function WaveDivider({
  className = "",
  flip = false,
}: WaveDividerProps) {
  return (
    <div
      className={`absolute left-0 right-0 w-full overflow-hidden leading-[0] ${
        flip ? "top-0 rotate-180" : "bottom-0"
      } ${className}`}
    >
      <svg
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative block w-full h-[120px] md:h-[180px] lg:h-[220px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C180,260 360,100 540,180 C720,260 900,120 1080,200 C1200,240 1360,160 1440,180 L1440,320 L0,320 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
