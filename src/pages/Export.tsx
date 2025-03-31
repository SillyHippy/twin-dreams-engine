
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

const Export: React.FC = () => {
  const handleExportCSV = () => {
    // This would be implemented with actual export functionality
    alert("Export to CSV feature would be implemented here");
  };

  const handleExportPDF = () => {
    // This would be implemented with actual export functionality
    alert("Export to PDF feature would be implemented here");
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Export Data</h1>
        <p className="text-muted-foreground">
          Export your serve records and client data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Client Data</CardTitle>
            <CardDescription>
              Export all client information to CSV or PDF format
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Serve Records</CardTitle>
            <CardDescription>
              Export all serve attempt records to CSV or PDF format
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Export;
