import { Loader2, RocketIcon } from "lucide-react";

type Props = {
  isLoading: boolean;
  isDetected: boolean;
  isColliding: boolean;
  distance: number;
  remainingLivesState: number;
  isGameOver: boolean;
};

function GameInfoOverlay({
  distance,
  isLoading,
  isDetected,
  isColliding,
  remainingLivesState,
  isGameOver,
}: Props) {
  return (
    <div
      className={`absolute z-30 h-screen w-screen flex items-center justify-center ${
        isColliding && " border-[20px] border-red-600 "
      }`}
    >
      {isLoading && <Loader2 size={80} className="animate-spin" />}
      {!isLoading && !isDetected && !isGameOver && (
        <div className="text-2xl font-extrabold animate-ping uppercase">
          P A U S E D
        </div>
      )}
      {isGameOver && (
        <div className="text-2xl font-extrabold animate-ping uppercase">
          {"G A M E  O V E R"}
        </div>
      )}
      <div className="fixed top-6 right-6">{"Distance " + distance}</div>
      <div className="fixed top-12 right-6 flex gap-2">
        {Array.from({ length: remainingLivesState }, (_, ind) => ind + 1).map(
          (el) => (
            <RocketIcon key={el} size={20} className="fill-red-600" />
          )
        )}
      </div>
    </div>
  );
}

export default GameInfoOverlay;
