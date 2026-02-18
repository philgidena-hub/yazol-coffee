interface WaveDividerProps {
  className?: string;
  flip?: boolean;
}

export default function WaveDivider({ className = "", flip = false }: WaveDividerProps) {
  return (
    <div
      className={`absolute left-0 right-0 w-full overflow-hidden leading-[0] ${
        flip ? "top-0 rotate-180" : "bottom-0"
      } ${className}`}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative block w-full h-[60px] md:h-[80px] lg:h-[120px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,110 1380,60 1440,40 L1440,120 L0,120 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
