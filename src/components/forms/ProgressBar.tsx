export type FileInputStatus = 'loading' | 'success' | 'error' | 'empty';

export interface ProgressBarProps {
  id?: string;
  statusFile: FileInputStatus;
  progressValue: number;
}

export const ProgressBar = ({ progressValue, statusFile }: ProgressBarProps) => {
  const getBgColor = (status: FileInputStatus) => {
    switch (status) {
      case 'loading':
        return 'bg-acc1-600';
      case 'success':
      case 'error':
        return `bg-${status}-600`;
      case 'empty':
      default:
        return 'bg-gray-600';
    }
  };
  return (
    <div className="flex h-5 w-full items-center gap-2">
      <div className="h-1 w-4/5 rounded bg-gray-400">
        <div className={`h-1 rounded ${getBgColor(statusFile)}`} style={{ width: `${progressValue}%` }}></div>
      </div>
      <div className="fontSize[caption] w-1/5">{`${progressValue}%`}</div>
    </div>
  );
};
