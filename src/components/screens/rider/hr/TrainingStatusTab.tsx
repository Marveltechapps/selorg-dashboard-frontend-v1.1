import React from "react";
import { Rider } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface TrainingStatusTabProps {
  riders: Rider[];
  loading: boolean;
}

export function TrainingStatusTab({ riders, loading }: TrainingStatusTabProps) {
  // Filter for active or onboarding riders who haven't completed training or are just done
  const trainingRiders = riders.filter(r => r.trainingStatus !== "completed" || r.status === "onboarding");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Training Progress</h3>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#F5F7FA]">
            <TableRow>
              <TableHead>Rider Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[30%]">Module Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
               </TableRow>
            ) : trainingRiders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-gray-500">No pending training</TableCell>
               </TableRow>
            ) : (
              trainingRiders.map((rider) => {
                // Mock progress logic
                const progress = rider.trainingStatus === "completed" ? 100 : 
                                 rider.trainingStatus === "in_progress" ? 60 : 0;
                const modules = rider.trainingStatus === "completed" ? "5/5" : 
                                rider.trainingStatus === "in_progress" ? "3/5" : "0/5";

                return (
                  <TableRow key={rider.id}>
                    <TableCell className="font-medium">{rider.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${rider.trainingStatus === 'not_started' ? 'bg-gray-50 border-gray-200 text-gray-700' : ''}
                        ${rider.trainingStatus === 'in_progress' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                        ${rider.trainingStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                      `}>
                        {rider.trainingStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{modules} Modules</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       {rider.trainingStatus !== 'completed' && (
                         <Button variant="outline" size="sm" className="h-8 text-xs">
                           Mark Completed
                         </Button>
                       )}
                       {rider.trainingStatus === 'completed' && (
                         <div className="flex items-center justify-end gap-1 text-green-600 text-sm">
                           <CheckCircle2 size={16} /> Done
                         </div>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
