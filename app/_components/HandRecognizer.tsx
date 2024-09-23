"use client";

import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

import { SetHandResultsType } from "@/types/types";

type Props = {
  setHandResults: SetHandResultsType;
};

async function initVideo(videoEl: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadeddata", () => {
    videoEl.play();
  });
}

async function initModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/hand_landmarker.task",
      delegate: "GPU",
    },
    numHands: 2,
    runningMode: "VIDEO",
  });

  return handLandmarker;
}

function processDetections(
  detections: HandLandmarkerResult,
  setHandResults: SetHandResultsType
) {
  //only proceed when both hands are detected
  if (detections && detections.handedness.length > 1) {
    const rightIndex =
      detections.handedness[0][0].categoryName === "Right" ? 0 : 1;
    const leftIndex = 1 - rightIndex;

    const { x: leftX, y: leftY } = detections.landmarks[leftIndex][6];
    const {
      x: rightX,
      y: rightY,
      // z: rightZ, there's also a z for us to use
    } = detections.landmarks[rightIndex][6];

    const tilt = (rightY - leftY) / (rightX - leftX);
    const degrees = (Math.atan(tilt) * 180) / Math.PI;

    setHandResults({
      isDetected: true,
      tilt,
      degrees,
    });
  } else {
    setHandResults({
      isDetected: false,
      tilt: 0,
      degrees: 0,
    });
  }
}

function HandRecognizer({ setHandResults }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(
    function () {
      let intervalId: NodeJS.Timeout | undefined;

      async function initVideoAndModel() {
        if (!videoRef.current) return;
        try {
          setHandResults({ isLoading: true });

          const videoEl = videoRef.current;
          await initVideo(videoEl);

          const handlandmarker = await initModel(); //this is our model
          intervalId = setInterval(() => {
            const detections = handlandmarker.detectForVideo(
              videoEl,
              Date.now()
            );
            processDetections(detections, setHandResults);
          }, 1000 / 30); //detect every ___ ms
        } catch (err) {
          const error = err as Error;
          console.log(error.message);
        } finally {
          setHandResults({ isLoading: false });
        }
      }

      initVideoAndModel();

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    },
    [setHandResults]
  );

  return (
    <div>
      <video
        className="-scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={videoRef}
      ></video>
    </div>
  );
}

export default HandRecognizer;
