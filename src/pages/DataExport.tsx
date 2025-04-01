import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import * as appwriteStorage from "@/utils/appwriteStorage";
import { cn } from "@/lib/utils";

const DataExport = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const storedStartDate = localStorage.getItem('exportStartDate');
    return storedStartDate ? new Date(storedStartDate) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const storedEndDate = localStorage.getItem('exportEndDate');
    return storedEndDate ? new Date(storedEndDate) : undefined;
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Save start and end dates to localStorage whenever they change
  React.useEffect(() => {
    if (startDate) {
      localStorage.setItem('exportStartDate', startDate.toISOString());
    } else {
      localStorage.removeItem('exportStartDate');
    }

    if (endDate) {
      localStorage.setItem('exportEndDate', endDate.toISOString());
    } else {
      localStorage.removeItem('exportEndDate');
    }
  }, [startDate, endDate]);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing date range",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const result = await appwriteStorage.exportServeData(startDate, endDate);

      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `serve-data-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export successful",
          description: "Serve data has been exported to a CSV file",
          variant: "success"
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Failed to export serve data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error exporting data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground">
          Export serve attempt data to a CSV file for analysis and reporting
        </p>
      </div>

      <Card className="neo-card">
        <CardHeader>
          <CardTitle>Export Serve Data</CardTitle>
          <CardDescription>
            Select a date range to export serve attempts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "PPP") : (
                      <span>Pick a start date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) =>
                      endDate ? date > endDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) =>
                      startDate ? date < startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                Exporting...
                <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              <>
                Export Data
                <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataExport;
