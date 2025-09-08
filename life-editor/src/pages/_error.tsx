// Custom error page to suppress extension errors
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, err }: ErrorProps) {
  // Don't render anything for extension errors
  if (err?.message?.includes('MetaMask') || 
      err?.message?.includes('chrome-extension://') ||
      err?.stack?.includes('chrome-extension://')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {statusCode}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {statusCode === 404
            ? 'This page could not be found.'
            : 'An error occurred on the server'}
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  // Suppress extension-related errors
  if (err?.message?.includes('MetaMask') || 
      err?.message?.includes('chrome-extension://')) {
    return { statusCode: 200 }; // Return OK status to suppress error
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;