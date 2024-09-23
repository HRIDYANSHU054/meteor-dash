import { RocketIcon } from "lucide-react";

type Props = {
  degrees: number;
};

function RocketComponent({ degrees }: Props) {
  return (
    <div className="rocket_shadow">
      <RocketIcon
        size={32}
        className=" fill-red-600 duration-[10ms] transition-all "
        style={{ transform: `rotate(${-45 - degrees / 3}deg)` }}
      />
    </div>
  );
}

export default RocketComponent;
