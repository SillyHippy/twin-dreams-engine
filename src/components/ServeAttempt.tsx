import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, MapPin, X, Send, CheckCircle, Calendar, Clock, User, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Camera from "./Camera";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import * as appwriteStorage from "@/utils/appwriteStorage";
import { sendEmail } from "@/utils/email";
import { ClientData } from "./ClientForm";
import { getLocationCoordinates, isGeolocationAvailable } from "@/utils/gps";

export interface ServeAttemptData {
  id?: string;
  clientId: string;
  timestamp: Date;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  imageData?: string | null;
  notes?: string;
  status: string;
  attemptNumber?: number;
  caseNumber?: string;
}

interface ServeAttemptProps {
  clients: ClientData[];
  addServe: (serve: ServeAttemptData) => Promise<boolean>;
  onCancel: () => void;
  preselectedClientId?: string;
  caseNumber?: string;
}

export default function ServeAttempt({ clients, addServe, onCancel, preselectedClientId, caseNumber }: ServeAttemptProps) {
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [timestamp, setTimestamp] = useState(new Date());
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("attempted");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState<number | undefined>(undefined);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleImageCapture = (data: string) => {
    setImageData(data);
    setIsCameraOpen(false);
  };

  const handleLocation = async () => {
    if (!isGeolocationAvailable()) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const coords = await getLocationCoordinates();
      setCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      toast({
        title: "Location Acquired",
        description: `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "Failed to get location",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast({
        title: "Missing Information",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const serveData: ServeAttemptData = {
      clientId,
      timestamp,
      address,
      coordinates,
      imageData,
      notes,
      status,
      attemptNumber,
      caseNumber
    };

    try {
      const success = await addServe(serveData);

      if (success) {
        toast({
          title: "Serve Attempt Saved",
          description: "Serve attempt has been recorded",
          variant: "success",
        });
        
        // Send email notification
        const client = clients.find(c => c.id === clientId);
        if (client) {
          const emailResult = await sendEmail({
            to: client.email,
            subject: `New Serve Attempt for ${client.name}`,
            body: `A new serve attempt has been recorded for ${client.name} on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}. Status: ${status}. Notes: ${notes || 'No notes.'}`,
            imageData: imageData || undefined,
            coordinates: coordinates || undefined
          });
          
          if (!emailResult.success) {
            toast({
              title: "Email Error",
              description: `Failed to send email: ${emailResult.message}`,
              variant: "destructive"
            });
          }
        }
        
        onCancel();
      } else {
        toast({
          title: "Error",
          description: "Failed to save serve attempt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving serve attempt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="neo-card">
      <CardHeader>
        <CardTitle>Record Serve Attempt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timestamp">Timestamp</Label>
            <div className="flex items-center space-x-2">
              <Calendar
                id="timestamp"
                mode="single"
                selected={timestamp}
                onSelect={(date) => date && setTimestamp(date)}
                className="w-full sm:w-auto"
              />
              <Clock
                id="time"
                onClick={() => {
                  const now = new Date();
                  setTimestamp(now);
                }}
                className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-secondary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Address where service was attempted"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={handleLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Get Location
            </Button>
            {coordinates && (
              <div className="text-sm text-muted-foreground">
                Latitude: {coordinates.latitude.toFixed(6)}, Longitude: {coordinates.longitude.toFixed(6)}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the serve attempt"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attempted">Attempted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {caseNumber && (
            <div>
              <Label htmlFor="attemptNumber">Attempt Number</Label>
              <input
                type="number"
                id="attemptNumber"
                placeholder="Attempt Number"
                value={attemptNumber || ''}
                onChange={(e) => setAttemptNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
              />
            </div>
          )}

          <div>
            <Label>Image</Label>
            {imageData ? (
              <div className="relative">
                <img src={imageData} alt="Serve Attempt" className="rounded-md max-h-48 w-full object-cover" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-secondary"
                  onClick={() => setImageData(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)}>
                <CameraIcon className="h-4 w-4 mr-2" />
                Take Picture
              </Button>
            )}
          </div>

          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Saving...
                </>
              ) : (
                <>
                  Record Serve <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>

      {isCameraOpen && (
        <Camera onCapture={handleImageCapture} onClose={() => setIsCameraOpen(false)} />
      )}
    </Card>
  );
}
