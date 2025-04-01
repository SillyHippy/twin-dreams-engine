
import React from 'react';

export interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

declare const Camera: React.FC<CameraComponentProps>;

export default Camera;
