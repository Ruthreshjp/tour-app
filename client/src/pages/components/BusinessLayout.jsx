import React, { Suspense } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

const BusinessLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      {/* No Header/Navbar for business routes */}
      <div className="min-h-screen">
        <Suspense fallback={<LoadingSpinner />}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Outlet />
          )}
        </Suspense>
      </div>
      {/* No Footer for business routes */}
      {/* ToastContainer is provided by parent RootLayout */}
    </>
  );
};

export default BusinessLayout;
