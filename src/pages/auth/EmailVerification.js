import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../utils/api";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        if (!token) {
          setVerificationStatus("error");
          setMessage(
            "Invalid verification link. Please check your email for the correct link."
          );
          return;
        }

        // Call the verification API
        const response = await authAPI.verifyEmail(token, email);

        if (response.success) {
          setVerificationStatus("success");
          setMessage(
            "Email verified successfully! You can now login to your account."
          );

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(
            response.message || "Email verification failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationStatus("error");
        setMessage(
          "An error occurred during email verification. Please try again or contact support."
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleResendVerification = async () => {
    try {
      const email = searchParams.get("email");
      if (!email) {
        toast.error("Email not found in URL. Please try signing up again.");
        return;
      }

      const response = await authAPI.resendVerificationEmail(email);

      if (response.success) {
        toast.success(
          "Verification email sent successfully! Please check your inbox."
        );
      } else {
        toast.error(response.message || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h2>
          <p className="text-gray-600">
            {verificationStatus === "verifying" &&
              "Verifying your email address..."}
            {verificationStatus === "success" && "Verification Complete!"}
            {verificationStatus === "error" && "Verification Failed"}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {verificationStatus === "verifying" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Please wait while we verify your email...
              </p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Verified Successfully!
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="text-sm text-gray-500 mb-4">
                Redirecting to login page in 3 seconds...
              </div>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Resend Verification Email
                </button>

                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Having trouble?{" "}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
