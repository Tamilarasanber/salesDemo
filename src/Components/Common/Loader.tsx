// Loader component
interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
};

const Loader = ({ size = "md", className = "" }: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} border-azure border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
