import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateStats {
  id: string;
  name: string;
  type: string;
  views: number;
  uploads: number;
  downloads: number;
  conversion: number;
}

interface TemplatePerformanceTableProps {
  data: TemplateStats[];
}

type SortKey = "name" | "views" | "uploads" | "downloads" | "conversion";
type SortDirection = "asc" | "desc";

export default function TemplatePerformanceTable({ data }: TemplatePerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    const multiplier = sortDirection === "asc" ? 1 : -1;
    
    if (typeof aValue === "string") {
      return multiplier * aValue.localeCompare(bValue as string);
    }
    return multiplier * ((aValue as number) - (bValue as number));
  });

  const maxValues = {
    views: Math.max(...data.map((d) => d.views)),
    uploads: Math.max(...data.map((d) => d.uploads)),
    downloads: Math.max(...data.map((d) => d.downloads)),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="h-8 px-2">
                  Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("views")} className="h-8 px-2">
                  Views <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("uploads")} className="h-8 px-2">
                  Uploads <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("downloads")} className="h-8 px-2">
                  Downloads <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("conversion")} className="h-8 px-2">
                  Conversion <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.type}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{template.views.toLocaleString()}</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${maxValues.views > 0 ? (template.views / maxValues.views) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{template.uploads.toLocaleString()}</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{ 
                          width: `${maxValues.uploads > 0 ? (template.uploads / maxValues.uploads) * 100 : 0}%`,
                          backgroundColor: "hsl(55 85% 55%)"
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{template.downloads.toLocaleString()}</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${maxValues.downloads > 0 ? (template.downloads / maxValues.downloads) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{template.conversion.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
