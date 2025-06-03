import { getBgColor } from '@/shared/utils/trajectoryUtils.ts';

export type FileInputStatus = 'loading' | 'success' | 'error' | 'empty';

export interface ProgressBarProps {
  id?: string;
  statusFile: FileInputStatus;
  progressValue: number;
}

export const ProgressBar = ({ progressValue, statusFile }: ProgressBarProps) => (
  <div className="flex h-5 w-full items-center gap-2">
    <div className="h-1 w-4/5 rounded bg-gray-w">
      <div className={`h-1 rounded ${getBgColor(statusFile)}`} style={{ width: `${progressValue}%` }}></div>
    </div>
    <div className={`w-1/5 text-caption opacity-${progressValue === 0 ? '0' : '100'}`}>{`${progressValue}%`}</div>
  </div>
);
