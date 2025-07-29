import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Redirect to plans page after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate("/plans");
        toast.info("You've been redirected to the plans page");
      } else {
        navigate("/login");
        toast.info("Please log in to view available plans");
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-200 h-3"></div>
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            {/* Cancel Icon */}
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            
            {/* Cancel Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your payment process was cancelled. No charges have been made.
            </p>
            
            {/* Details Card */}
            <div className="w-full bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What would you like to do next?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-700">Try again with a different payment method</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-700">Contact our support team for assistance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-700">Explore other pricing options that might better fit your needs</span>
                </li>
              </ul>
            </div>
            
            {/* Common Questions */}
            <div className="w-full bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Common Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">Will I be charged for cancelling?</h3>
                  <p className="text-gray-600 text-sm">No, you won't be charged anything for cancelling the payment process.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Can I try again later?</h3>
                  <p className="text-gray-600 text-sm">Yes, you can return to the plans page and try again at any time.</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link to="/plans" className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-center">
                Return to Plans
              </Link>
              <Link to="/dashboard" className="flex-1 py-3 px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition duration-200 text-center">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-500">
        <p>Need help? Contact our <Link to="/dashboard" className="text-blue-600 hover:underline">support team</Link></p>
      </div>
    </div>
  );
};

export default PaymentCancel;
