import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ClipboardList, Clock, Edit, Trash2 } from "lucide-react";
import { ServeAttemptData } from "@/components/ServeAttempt";

interface ServeHistoryProps {
  serves: ServeAttemptData[];
  clients: any[];
  onDelete?: (id: string) => void;
  onEdit?: (serve: ServeAttemptData) => void;
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "Unknown date";
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
    return parsedDate.toLocaleString(); // Adjust format as needed
  } catch (error) {
    console.error("Date formatting error:", error, date);
    return "Unknown date";
  }
};

const formatCoordinates = (coords: string | null | undefined | { latitude: number; longitude: number }): string => {
  if (!coords) {
    return "No coordinates available";
  }
  
  // Handle both string format "lat,lng" and object format
  if (typeof coords === "string") {
    const [latitude, longitude] = coords.split(",");
    if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return "Invalid coordinates";
    }
    return `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`;
  } else if (typeof coords === "object" && coords !== null) {
    // Handle object format with latitude and longitude properties
    const lat = coords.latitude;
    const lng = coords.longitude;
    if (lat === undefined || lng === undefined) {
      return "Invalid coordinates";
    }
    return `${parseFloat(String(lat)).toFixed(6)}, ${parseFloat(String(lng)).toFixed(6)}`;
  }
  
  return "Invalid coordinates";
};

const getGoogleMapsLink = (coords: string | null | undefined | { latitude: number; longitude: number }): string | null => {
  if (!coords) return null;
  
  // Handle both string format "lat,lng" and object format
  let latitude, longitude;
  
  if (typeof coords === "string") {
    [latitude, longitude] = coords.split(",");
  } else if (typeof coords === "object" && coords !== null) {
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  if (!latitude || !longitude || isNaN(parseFloat(String(latitude))) || isNaN(parseFloat(String(longitude)))) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

const getClientName = (clientId: string | undefined | null, clients: any[]): string => {
  if (!clientId || clientId === "unknown") {
    console.warn("Missing or invalid client ID in serve attempt:", clientId);
    return "Unknown Client";
  }

  const client = clients.find((c) => c.id === clientId || c.$id === clientId);
  return client?.name || "Unknown Client";
};

const ServeHistory: React.FC<ServeHistoryProps> = ({ serves, clients, onDelete, onEdit }) => {
  console.log("ServeHistory component received serves:", serves);
  console.log("ServeHistory component received clients:", clients);

  if (!serves || serves.length === 0) {
    console.warn("No serves array provided to ServeHistory component or array is empty");
    return (
      <div className="text-center p-8">
        <p>No serve history found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {serves.map((serve) => {
        // Make sure we have a valid serve object with an id
        if (!serve || !serve.id) {
          console.warn("Invalid serve attempt in list:", serve);
          return null;
        }
        
        // Get client name - first use directly from serve object, fall back to lookup by id
        const clientName = serve.clientName && serve.clientName !== "Unknown Client" 
          ? serve.clientName 
          : getClientName(serve.clientId, clients);
        
        const googleMapsLink = getGoogleMapsLink(serve.coordinates);
        
        // Debug information
        console.log(`Rendering serve ${serve.id}:`, {
          clientName,
          clientId: serve.clientId,
          coordinates: serve.coordinates,
          formattedCoordinates: formatCoordinates(serve.coordinates),
          googleMapsLink,
          status: serve.status,
          timestamp: serve.timestamp,
          formattedDate: formatDate(serve.timestamp)
        });

        return (
          <Card key={serve.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{clientName}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  serve.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  serve.status === 'failed' ? 'bg-amber-100 text-amber-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {serve.status === 'completed' ? 'Successful' : 
                   serve.status === 'failed' ? 'Failed' : 
                   'Unknown'}
                </span>
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Case: {serve.caseName || serve.caseNumber || "Unknown"}</span>
                </span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="space-y-2">
                {serve.imageData && (
                  <div className="rounded-md overflow-hidden mb-3 border h-36">
                    <img 
                      src={serve.imageData} 
                      alt="Serve attempt" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        e.currentTarget.src = "https://placehold.co/400x300?text=No+Image";
                      }}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </p>
                    <p className="text-muted-foreground">{formatDate(serve.timestamp)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </p>
                    {googleMapsLink ? (
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {formatCoordinates(serve.coordinates)}
                      </a>
                    ) : (
                      <p className="text-muted-foreground truncate">{formatCoordinates(serve.coordinates)}</p>
                    )}
                  </div>
                </div>
                
                {serve.notes && (
                  <div className="space-y-1 text-xs pt-2">
                    <p className="font-medium">Notes</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{serve.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <div className="flex w-full justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(serve.timestamp)}</span>
                </div>
                
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(serve)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:text-destructive"
                      onClick={() => onDelete(serve.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ServeHistory;
