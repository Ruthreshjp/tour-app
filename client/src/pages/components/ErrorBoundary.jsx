// src/pages/components/ErrorBoundary.jsx
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    // Handle specific route errors (404, etc.)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-xl p-8 text-center bg-white shadow-lg rounded-lg">
          <h1 className="mb-4 text-4xl font-bold text-red-600">
            {error.status} {error.statusText}
          </h1>
          <p className="mb-8 text-gray-600">{error.data?.message || "Something went wrong"}</p>
          <div className="space-y-4">
            <p className="text-gray-600">
              {error.status === 404 
                ? "Sorry, the page you're looking for doesn't exist." 
                : "An unexpected error occurred."}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle other errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-xl p-8 text-center bg-white shadow-lg rounded-lg">
        <h1 className="mb-4 text-4xl font-bold text-red-600">Oops!</h1>
        <p className="mb-8 text-gray-600">Something went wrong</p>
        <div className="space-y-4">
          <p className="text-gray-600">
            {error instanceof Error 
              ? error.message 
              : "An unexpected error occurred. Please try again later."}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;