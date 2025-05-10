import { LoaderCircle } from "lucide-react";

const Spinner = () => {
  return (
    <div className="bg-neutral-900 h-screen w-screen flex items-center justify-center">
      <LoaderCircle className="animate-spin size-10 text-editor" />
    </div>
  );
};

export default Spinner;
