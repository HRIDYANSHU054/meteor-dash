"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Boulder, SetHandResultsType } from "@/types/types";
import HandRecognizer from "@/app/_components/HandRecognizer";
import RocketComponent from "./_components/RocketComponent";
import BoulderComponent from "@/app/_components/BoulderComponent";
import GameInfoOverlay from "@/app/_components/GameInfoOverlay";
import { playAudioFX, playBackgroundAudio } from "@/utils/audioHandler";

let isInvincible = false; //after a collision, grant the user invincibility for 1s(no collision is detected in this time)
let remainingLives: number;
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [rocketLeft, setRocketLeft] = useState(0);
  const [isDetected, setIsDetected] = useState(false);
  const [degrees, setDegrees] = useState(0);
  const [boulders, setBoulders] = useState<Boulder[]>([]);
  const [collisionTrigger, setCollisionTrigger] = useState(0);
  const [isColliding, setIsColliding] = useState(false);
  const [distance, setDistance] = useState(0);
  const [remainingLivesState, setRemainingLivesState] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rocketCoords, setRocketCoords] = useState<DOMRect | null>(null);
  const rocketRef = useRef<HTMLDivElement | null>(null);

  //BG audio
  useEffect(
    function () {
      if (isDetected && !isGameOver) {
        playBackgroundAudio(false);
      } else {
        playBackgroundAudio(true);
      }
    },
    [isGameOver, isDetected]
  );

  useEffect(function () {
    //centers the rocket at the start of the game ( technically also on further remounts of this page )
    setRocketLeft(window.innerWidth / 2);
    remainingLives = 5; //start with 5 lives
    setRemainingLivesState(remainingLives);
  }, []);

  useEffect(
    function () {
      if (isDetected && !isGameOver) {
        const distanceIntervalId = setInterval(() => {
          setDistance((dist) => dist + 1);
        }, 100); //every 100ms the rocket covers 1mile

        return () => {
          if (distanceIntervalId) clearInterval(distanceIntervalId);
        };
      }
    },
    [isGameOver, isDetected]
  );

  useEffect(
    function () {
      if (isDetected && !isGameOver) {
        const generateIntervalId = setInterval(() => {
          setBoulders((boulders) => {
            let bouldersArr = [...boulders];
            for (let i = 0; i < 4; i++) {
              const now = Date.now(); //timestamp will help us to check the boulder age
              bouldersArr = [
                ...bouldersArr,
                {
                  timestamp: now,
                  id: `${now}-${Math.random()}`,
                },
              ];
            }
            return bouldersArr;
          });
        }, 1000); //every 1s create 4 more boulder

        //for cleaning up the boulders(5s old) from dom
        const removalIntervalId = setInterval(() => {
          setBoulders((boulders) => {
            const now = Date.now();
            return boulders.filter((boulder) => now - boulder.timestamp < 5000);
          });
        }, 5000);

        return () => {
          if (generateIntervalId) clearInterval(generateIntervalId);
          if (removalIntervalId) clearInterval(removalIntervalId);
        };
      }
    },
    [isGameOver, isDetected]
  );

  /* const setHandResults: SetHandResultsType = (result) => {
    setIsLoading((prev) => result.isLoading ?? prev);
    setIsDetected((prev) => result.isDetected ?? prev);
    if (result.degrees && result.degrees !== 0) {
      setDegrees(result.degrees);
      setCollisionTrigger(Math.random());
      setRocketLeft((rocketLeft) => {
        //a little logic to prevent rocket flying off from the screen
        const newRocketLeft = rocketLeft - (result.degrees ?? 0) / 6;
        if (
          newRocketLeft < 20 ||
          newRocketLeft > window.innerWidth - (20 + 32)
        ) {
          //we want 20px padding on left and right
          return rocketLeft;
        }
        return newRocketLeft;
      });
    }

    if (rocketRef.current)
      setRocketCoords(rocketRef.current.getBoundingClientRect());
  }; */

  const setHandResults = useCallback<SetHandResultsType>(
    (result) => {
      setIsLoading((prev) => result.isLoading ?? prev);
      setIsDetected((prev) => result.isDetected ?? prev);

      if (result.degrees && result.degrees !== 0) {
        setDegrees(result.degrees);
        setCollisionTrigger(Math.random());

        setRocketLeft((rocketLeft) => {
          const newRocketLeft = rocketLeft - (result.degrees ?? 0) / 6;
          if (
            newRocketLeft < 20 ||
            newRocketLeft > window.innerWidth - (20 + 32)
          ) {
            return rocketLeft;
          }
          return newRocketLeft;
        });
      }

      if (rocketRef.current) {
        setRocketCoords(rocketRef.current.getBoundingClientRect());
      }
    },
    [
      setIsLoading,
      setIsDetected,
      setDegrees,
      setCollisionTrigger,
      setRocketLeft,
      rocketRef,
      setRocketCoords,
    ]
  );

  const handleCollision = useCallback(() => {
    //COLLISION 💥💥
    //on collision do
    if (!isInvincible && !isGameOver) {
      console.log("COLLISION!!!");
      isInvincible = true;
      setIsColliding(isInvincible);
      playAudioFX();
      remainingLives = remainingLives - 1;
      setRemainingLivesState(remainingLives);
      if (remainingLives <= 0) {
        // game over 💀
        setIsGameOver(true);
      }
      setTimeout(() => {
        isInvincible = false;
        setIsColliding(isInvincible);
      }, 1500);
    }
  }, [isGameOver]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div
        className={`absolute left-3 top-2 z-30 transition-all duration-500 ${
          isDetected ? " w-36 " : " w-48 "
        }`}
      >
        <HandRecognizer setHandResults={setHandResults} />
      </div>
      <div
        id="rocket-container"
        ref={rocketRef}
        style={{
          position: "absolute",
          left: rocketLeft,
          transitionDuration: "10ms",
          transition: "all",
          marginTop: "500px",
        }}
      >
        <RocketComponent degrees={degrees} />
      </div>
      <div className="absolute z-10 h-screen w-screen overflow-hidden">
        {boulders.map((boulder) => (
          <BoulderComponent
            key={boulder.id}
            isMoving={isDetected}
            rocketCoords={rocketCoords}
            onCollision={handleCollision}
            checkCollisionWhen={collisionTrigger}
          />
        ))}
      </div>

      <GameInfoOverlay
        isLoading={isLoading}
        isDetected={isDetected}
        isColliding={isColliding}
        distance={distance}
        isGameOver={isGameOver}
        remainingLivesState={remainingLivesState}
      />
    </main>
  );
}
