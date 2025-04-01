
import React from 'react';

export interface CameraComponentProps {
  onCapture: (imageData: string, location?: GeolocationCoordinates) => void;
  onClose: () => void;
}

declare const Camera: React.FC<CameraComponentProps>;

export default Camera;
