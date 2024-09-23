"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  isMoving?: boolean;
  rocketCoords: DOMRect | null;
  checkCollisionWhen: number;
  onCollision: () => void;
};

function BoulderComponent({
  isMoving,
  rocketCoords,
  onCollision,
  checkCollisionWhen,
}: Props) {
  const [xPos, setXPos] = useState(0); //80 padding from right of screen
  const [yPos, setYPos] = useState(-100);
  const [rotation, setRotation] = useState(0);
  const boulderRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    function () {
      function detectCollision() {
        if (boulderRef.current && rocketCoords) {
          const boulderRect = boulderRef.current.getBoundingClientRect();
          const hasCollide =
            boulderRect.left + 30 < rocketCoords.right &&
            boulderRect.right - 30 > rocketCoords.left &&
            boulderRect.bottom - 30 > rocketCoords.top &&
            boulderRect.top + 30 < rocketCoords.bottom;
          if (hasCollide) {
            onCollision();
          }
        }
      }

      detectCollision();
    },
    [checkCollisionWhen, onCollision, rocketCoords]
  );

  useEffect(function () {
    setXPos(Math.random() * (window.innerWidth - 100));
    setYPos(-Math.random() * 180 - 100);
    setRotation(Math.random() * 360);
  }, []);

  return (
    <div
      ref={boulderRef}
      className="boulder_shadow absolute"
      style={{
        left: xPos,
        top: yPos,
        animation: "falling 12s linear forwards",
        animationPlayState: isMoving ? "running" : "paused",
      }}
    >
      <Image
        src="/met.png"
        width={80}
        height={80}
        alt="bolder"
        style={{ rotate: `${rotation}deg` }}
      />
    </div>
  );
}

export default BoulderComponent;
