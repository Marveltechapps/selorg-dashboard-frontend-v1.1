import React from "react";
import { Rider } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, FileText, Send } from "lucide-react";
import { format } from "date-fns";

interface ContractsComplianceTabProps {
  riders: Rider[];
  loading: boolean;
}

export function ContractsComplianceTab({ riders, loading }: ContractsComplianceTabProps) {
  return (
    <div className="space-y-6">
      {/* Compliance Alerts Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-500" />
          Compliance Alerts
        </h3>
        <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
           <Table>
             <TableHeader className="bg-red-50/50">
               <TableRow>
                 <TableHead>Rider Name</TableHead>
                 <TableHead>Issue</TableHead>
                 <TableHead>Last Audit</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {riders.filter(r => !r.compliance.isCompliant || r.suspension?.isSuspended).map(rider => (
                 <TableRow key={rider.id}>
                   <TableCell className="font-medium">{rider.name}</TableCell>
                   <TableCell>
                     {rider.suspension?.isSuspended ? (
                       <span className="text-red-600 font-medium">Suspended: {rider.suspension.reason}</span>
                     ) : (
                       <span className="text-orange-600">Policy Violation ({rider.compliance.policyViolationsCount})</span>
                     )}
                   </TableCell>
                   <TableCell className="text-gray-500">
                     {format(new Date(rider.compliance.lastAuditDate), "MMM d, yyyy")}
                   </TableCell>
                   <TableCell>
                     <Badge variant="destructive">Non-Compliant</Badge>
                   </TableCell>
                   <TableCell className="text-right">
                     <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                       Manage Suspension
                     </Button>
                   </TableCell>
                 </TableRow>
               ))}
               {riders.filter(r => !r.compliance.isCompliant || r.suspension?.isSuspended).length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-4 text-green-600">
                     No critical compliance issues found.
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
        </div>
      </div>

      {/* Contracts Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" />
          Contract Management
        </h3>
        <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-[#F5F7FA]">
              <TableRow>
                <TableHead>Rider Name</TableHead>
                <TableHead>Contract Period</TableHead>
                <TableHead>Renewal Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                 </TableRow>
              ) : (
                riders.slice(0, 5).map((rider) => ( // Just showing first 5 for demo
                  <TableRow key={rider.id}>
                    <TableCell className="font-medium">{rider.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(rider.contract.startDate), "MMM yyyy")} - {format(new Date(rider.contract.endDate), "MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {rider.contract.renewalDue ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Renewal Due</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-200">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       {rider.contract.renewalDue && (
                         <Button variant="ghost" size="sm" className="h-8 gap-2 text-blue-600">
                           <Send size={14} /> Send Reminder
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
