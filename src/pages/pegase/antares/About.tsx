import { useEffect, useState } from 'react';
import { fetchAppInfo } from '@/shared/services/aboutService.ts';
import { AppInfo } from '@/shared/types/AppInfo';

const TableRow = ({ label, value }) => (
  <tr>
    <td className="py-1 px-2 border-b border-gray-200 text-sm">{label}</td>
    <td className="py-1 px-2 border-b border-gray-200 text-sm">{value}</td>
  </tr>
);

export const About = () => {
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    fetchAppInfo()
      .then(data => {
        setInfo(data);
      })
      .catch(error => {
        console.error('Error fetching info:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">À propos</h1>
      {info ? (
        <table className="min-w-full bg-white">
          <tbody>
            <TableRow className="font-bold" label="App Name" value={info.appName} />
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