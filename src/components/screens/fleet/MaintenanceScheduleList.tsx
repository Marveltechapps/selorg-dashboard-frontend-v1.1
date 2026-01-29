import React from "react";
import { MaintenanceTask, updateMaintenanceTask } from "./fleetApi";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MaintenanceScheduleListProps {
  tasks: MaintenanceTask[];
  loading: boolean;
  onRefresh: () => void;
}

export function MaintenanceScheduleList({ tasks, loading, onRefresh }: MaintenanceScheduleListProps) {
  const handleStatusUpdate = async (id: string, status: MaintenanceTask["status"]) => {
    try {
      await updateMaintenanceTask(id, { status });
      toast.success(`Task marked as ${status}`);
      onRefresh();
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming": return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Upcoming</Badge>;
      case "in_progress": return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">In Progress</Badge>;
      case "completed": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="mt-6 border-[#E0E0E0] shadow-sm">
      <CardHeader className="pb-3 border-b border-[#E0E0E0] bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
           <CalendarClock className="text-gray-500" />
           <CardTitle className="text-lg text-[#212121]">Maintenance Schedule</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Workshop</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading schedule...</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">No scheduled maintenance tasks found.</TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{task.vehicleId}</TableCell>
                  <TableCell>{task.type}</TableCell>
                  <TableCell>{new Date(task.scheduledDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.workshopName || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         {task.status === 'upcoming' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'in_progress')}>
                              <Clock className="mr-2 h-4 w-4" /> Start Service
                            </DropdownMenuItem>
                         )}
                         {task.status === 'in_progress' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'completed')}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                            </DropdownMenuItem>
                         )}
                         <DropdownMenuItem disabled>Reschedule (Coming Soon)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
