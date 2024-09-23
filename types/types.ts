export type SetHandResultsType = (data: {
  tilt?: number;
  degrees?: number;
  isDetected?: boolean;
  isLoading?: boolean;
}) => void;

export type Boulder = {
  timestamp: number;
  id: string;
};
