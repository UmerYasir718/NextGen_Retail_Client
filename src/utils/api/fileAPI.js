import apiClient from "./apiClient";

const fileAPI = {
  // Upload a CSV file
  uploadFile: async (file, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    return apiClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get all files
  getFiles: async () => {
    return apiClient.get("/files");
  },

  // Get a single file by ID
  getFile: async (fileId) => {
    return apiClient.get(`/files/${fileId}`);
  },

  // Update file status
  updateFileStatus: async (fileId, status) => {
    return apiClient.put(`/files/${fileId}/status`, { status });
  },

  // Delete a file
  deleteFile: async (fileId) => {
    return apiClient.delete(`/files/${fileId}`);
  },

  // Get files by type
  getFilesByType: async (fileType) => {
    return apiClient.get(`/files?fileType=${fileType}`);
  },

  // Download processed file (AI response file)
  // downloadProcessedFile: async (fileId) => {
  //   try {
  //     console.log(`Starting download for file ID: ${fileId}`);

  //     // First get the file details to get the responseFileUrl
  //     const fileResponse = await apiClient.get(`/files/${fileId}`);
  //     const fileData = fileResponse.data;

  //     console.log("File data received:", {
  //       id: fileData._id,
  //       responseFileUrl: fileData.responseFileUrl,
  //       originalName: fileData.originalName,
  //     });

  //     if (!fileData.responseFileUrl) {
  //       throw new Error("No response file URL available for this file");
  //     }

  //     // Check if it's a Cloudinary URL
  //     if (fileData.responseFileUrl.includes("cloudinary.com")) {
  //       console.log("Detected Cloudinary URL, attempting download...");

  //       try {
  //         // Method 1: Try direct download with fetch
  //         console.log("Attempting direct fetch from Cloudinary...");
  //         const response = await fetch(fileData.responseFileUrl);

  //         console.log("Fetch response:", {
  //           ok: response.ok,
  //           status: response.status,
  //           statusText: response.statusText,
  //           headers: Object.fromEntries(response.headers.entries()),
  //         });

  //         if (!response.ok) {
  //           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //         }

  //         const blob = await response.blob();
  //         console.log("Blob received:", {
  //           size: blob.size,
  //           type: blob.type,
  //         });

  //         // Create download link
  //         const url = window.URL.createObjectURL(blob);
  //         const link = document.createElement("a");
  //         link.href = url;

  //         // Extract filename from URL or use default
  //         const urlParts = fileData.responseFileUrl.split("/");
  //         const filename = urlParts[urlParts.length - 1] || "forecast.pdf";

  //         link.download = filename;
  //         document.body.appendChild(link);
  //         link.click();
  //         link.remove();
  //         window.URL.revokeObjectURL(url);

  //         console.log("Direct download completed successfully");
  //         return { success: true, message: "File downloaded successfully" };
  //       } catch (fetchError) {
  //         console.warn(
  //           "Direct fetch failed, trying fallback method:",
  //           fetchError
  //         );

  //         // Method 2: Fallback to opening in new tab for Cloudinary
  //         console.log("Using fallback method - opening in new tab");
  //         const link = document.createElement("a");
  //         link.href = fileData.responseFileUrl;
  //         link.target = "_blank";
  //         link.rel = "noopener noreferrer";

  //         // Extract filename from URL or use default
  //         const urlParts = fileData.responseFileUrl.split("/");
  //         const filename = urlParts[urlParts.length - 1] || "forecast.pdf";

  //         link.download = filename;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);

  //         console.log("Fallback method completed");
  //         return {
  //           success: true,
  //           message:
  //             "File opened in new tab. You can right-click and save it manually.",
  //           fallback: true,
  //         };
  //       }
  //     } else {
  //       console.log("Using standard API download method");
  //       // For regular API endpoints, use the standard download approach
  //       const response = await apiClient.get(`/files/${fileId}/download`, {
  //         responseType: "blob",
  //       });

  //       // Create download link
  //       const url = window.URL.createObjectURL(new Blob([response.data]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = fileData.originalName || "processed_file";
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);

  //       return { success: true, message: "File downloaded successfully" };
  //     }
  //   } catch (error) {
  //     console.error("Error downloading processed file:", error);
  //     throw new Error(
  //       error.response?.data?.message ||
  //         error.message ||
  //         "Failed to download file"
  //     );
  //   }
  // },

  // Download processed file (AI response file)
  downloadProcessedFile: async (fileId) => {
    try {
      console.log(`Starting download for file ID: ${fileId}`);

      // Get file details from API
      const fileResponse = await apiClient.get(`/files/${fileId}`);
      const fileData = fileResponse.data?.data;
      console.log("fileData", fileData);
      if (!fileData.responseFileUrl) {
        throw new Error("No response file URL available for this file");
      }

      const fileUrl = fileData.responseFileUrl;
      console.log("File URL:", fileUrl);

      // Extract filename from URL or use original name
      const urlParts = fileUrl.split("/");
      const filename =
        fileData.originalName ||
        urlParts[urlParts.length - 1] ||
        "downloaded_file";

      // If Cloudinary link
      if (fileUrl.includes("cloudinary.com")) {
        console.log("Detected Cloudinary URL");

        // Direct browser download (avoids CORS for public links)
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", filename); // Works for most browsers
        link.setAttribute("target", "_blank"); // Open in new tab if inline-viewable
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Download triggered via direct link");
        return { success: true, message: "Download triggered" };
      }

      // For non-Cloudinary URLs: use API to get blob
      console.log("Non-Cloudinary URL, downloading via API...");
      const response = await apiClient.get(`/files/${fileId}/download`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log("Download completed via API");
      return { success: true, message: "File downloaded successfully" };
    } catch (error) {
      console.error("Error downloading processed file:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to download file"
      );
    }
  },

  // Download file as PDF (new function)
  downloadFileAsPDF: async (fileId) => {
    try {
      console.log(`Starting PDF download for file ID: ${fileId}`);

      // Get file details from API
      const fileResponse = await apiClient.get(`/files/${fileId}`);
      const fileData = fileResponse.data?.data;
      console.log("fileData for PDF:", fileData);

      if (!fileData.responseFileUrl) {
        throw new Error("No response file URL available for this file");
      }

      const fileUrl = fileData.responseFileUrl;
      const filename = fileData.originalName || "file";
      const pdfFilename = filename.replace(/\.[^.]+$/, "") + ".pdf";

      console.log("Converting to PDF:", { fileUrl, filename, pdfFilename });

      // Call the PDF generation endpoint
      const response = await apiClient.get(`/files/${fileId}/download-pdf`, {
        responseType: "blob",
      });

      // Create download link for the PDF
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log("PDF download completed");
      return {
        success: true,
        message: "PDF downloaded successfully",
        filename: pdfFilename,
      };
    } catch (error) {
      console.error("Error downloading file as PDF:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate PDF"
      );
    }
  },
};

export default fileAPI;
