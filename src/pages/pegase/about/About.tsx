import { useEffect, useState } from 'react';
import { fetchAppInfo } from '@/shared/services/aboutService.ts';
import { AppInfo } from '@/shared/types/AppInfo.ts';
import packageJson from '../../../../package.json';
import { GIT_INFO } from '@/gitInfo.ts';

interface TableRowProps {
  label: string;
  value: string;
}

const TableRow = ({ label, value }: TableRowProps) => (
  <tr>
    <td className="text-sm border-b border-gray-200 px-2 py-1">{label}</td>
    <td className="text-sm border-b border-gray-200 px-2 py-1">{value}</td>
  </tr>
);

export const About = () => {
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    fetchAppInfo()
      .then((data) => {
        setInfo(data);
      })
      .catch((error) => {
        console.error('Error fetching info:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4 font-bold">À propos</h1>

      <div>
        <h1>
          {packageJson.name} (v{packageJson.version})
        </h1>
        <h3>Git</h3>
        <p>Branch: {GIT_INFO.branch}</p>
        <p>Commit: {GIT_INFO.commit}</p>
        <p>Build Time: {GIT_INFO.buildTime}</p>
      </div>
      {info ? (
        <table className="bg-white min-w-full">
          <tbody>
            <TableRow label="App Name" value={info.appName} />
            <TableRow label="App Description" value={info.appDescription} />
            <TableRow label="App Version" value={info.appVersion} />
            <TableRow label="Git Branch" value={info.appBranch} />
            <TableRow label="Git Commit ID" value={info.commitId} />
            <TableRow label="Git Commit Time" value={info.time} />
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default About;
