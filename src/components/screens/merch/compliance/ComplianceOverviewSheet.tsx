import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { ComplianceScoreComponent } from './types';
import { COMPLIANCE_SCORES } from './mockData';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ComplianceOverviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplianceOverviewSheet({ isOpen, onClose }: ComplianceOverviewSheetProps) {
  const totalScore = COMPLIANCE_SCORES.reduce((acc, curr) => acc + (curr.score * (curr.weight / 100)), 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl">Compliance Overview</SheetTitle>
          <SheetDescription>
            Detailed breakdown of regional compliance scoring.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
            {/* Total Score */}
            <div className="text-center space-y-2">
                <div className="relative inline-flex items-center justify-center">
                     <svg className="h-32 w-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * totalScore) / 100} className="text-green-500" />
                     </svg>
                     <span className="absolute text-2xl font-black text-gray-900">{Math.round(totalScore)}%</span>
                </div>
                <p className="text-sm text-gray-500">Overall Score (Global)</p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Category Breakdown</h3>
                <div className="space-y-4">
                    {COMPLIANCE_SCORES.map((cat) => (
                        <div key={cat.category} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium">{cat.category}</span>
                                <div className="flex items-center gap-2">
                                     {cat.issues > 0 && <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={10} /> {cat.issues} Issues</span>}
                                     <span className="font-bold text-gray-700">{cat.score}%</span>
                                </div>
                            </div>
                            <Progress value={cat.score} className={`h-2 ${cat.score < 90 ? 'bg-red-100' : 'bg-gray-100'}`} />
                            <div className="text-xs text-gray-400 text-right">Weight: {cat.weight}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Violations */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> Recent Violations
                </h4>
                <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex gap-2 items-start">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                        <span>Campaign #999 failed margin check (-2%). Override pending.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                        <span>2 Promotional images missing alt text (ADA Compliance).</span>
                    </li>
                </ul>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
