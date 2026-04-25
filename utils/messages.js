const LANG = process.env.APP_LANG || "en";

const translations = {
   en: {
      HTTP_STATUS: {
         OK: { code: 200, message: "OK" },
         CREATED: { code: 201, message: "Created" },
         ACCEPTED: { code: 202, message: "Accepted" },
         BAD_REQUEST: { code: 400, message: "Bad Request" },
         UNAUTHORIZED: { code: 401, message: "Unauthorized" },
         FORBIDDEN: { code: 403, message: "Forbidden" },
         NOT_FOUND: { code: 404, message: "Not Found" },
         CONFLICT: { code: 409, message: "Conflict" },
         INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
         NOT_IMPLEMENTED: { code: 501, message: "Not Implemented" },
         SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
      },

      // General
      all_fields_required: "All fields are required",
      invalid_credentials: "Invalid username or password",

      // Auth
      login_success: "Login successful",
      logout_success: "Logout successful",
      register_success: "User registered successfully",

      refresh_token_required: "Refresh token required",
      invalid_refresh_token: "Invalid refresh token",
      invalid_or_expired_refresh_token: "Invalid or expired refresh token",
      access_token_refreshed: "Access token refreshed",

      username_exists: "Username already exists",
      logout_error: "Error during logout",

      // Specific error messages
      data_found: "Data found",
      no_data_found: "No data found",
      not_found: "Not found",
      x_not_found: "%{name} not found!",
      updated_successfully: "Updated successfully",
      x_updated_successfully: "%{name} updated successfully",
      created_successfully: "Created successfully",
      x_created_successfully: "%{name} created successfully",
      deleted_successfully: "Deleted successfully",
      x_deleted_successfully: "%{name} deleted successfully",
      request_submitted: "Order %{code} Code has been Submitted successfully",
      orders_not_found: "No orders yet",
      duplicate_name: "%{name} with this name already exists.",
   },

   id: {
      HTTP_STATUS: {
         OK: { code: 200, message: "Berhasil" },
         CREATED: { code: 201, message: "Berhasil dibuat" },
         ACCEPTED: { code: 202, message: "Diterima" },
         BAD_REQUEST: { code: 400, message: "Permintaan tidak valid" },
         UNAUTHORIZED: { code: 401, message: "Tidak terautorisasi" },
         FORBIDDEN: { code: 403, message: "Dilarang" },
         NOT_FOUND: { code: 404, message: "Tidak ditemukan" },
         CONFLICT: { code: 409, message: "Konflik" },
         INTERNAL_SERVER_ERROR: { code: 500, message: "Kesalahan server" },
         NOT_IMPLEMENTED: { code: 501, message: "Belum diimplementasikan" },
         SERVICE_UNAVAILABLE: { code: 503, message: "Layanan tidak tersedia" },
      },

      // General
      all_fields_required: "Semua field wajib diisi",
      invalid_credentials: "Username atau password salah",

      // Auth
      login_success: "Login berhasil",
      logout_success: "Logout berhasil",
      register_success: "User berhasil didaftarkan",

      refresh_token_required: "Refresh token diperlukan",
      invalid_refresh_token: "Refresh token tidak valid",
      invalid_or_expired_refresh_token: "Refresh token tidak valid atau kadaluarsa",
      access_token_refreshed: "Access token berhasil diperbarui",

      username_exists: "Username sudah digunakan",
      logout_error: "Terjadi kesalahan saat logout",

      // Specific error messages
      data_found: "Data ditemukan",
      no_data_found: "Tidak ada data ditemukan",
      not_found: "Tidak ditemukan",
      x_not_found: "%{name} tidak ditemukan!",
      updated_successfully: "Berhasil diperbarui",
      x_updated_successfully: "%{name} berhasil diperbarui",
      created_successfully: "Berhasil dibuat",
      x_created_successfully: "%{name} berhasil dibuat",
      deleted_successfully: "Berhasil dihapus",
      x_deleted_successfully: "%{name} berhasil dihapus",
      request_submitted: "Pesanan dengan kode %{code} berhasil dikirim",
      orders_not_found: "Belum ada pesanan",
      duplicate_name: "%{name} dengan nama ini sudah ada.",
   },
};

const activeLang = translations[LANG] ? LANG : "en";

const messages = {
   ...translations[activeLang],

   getMessageByCode: (code) => {
      const statuses = translations[activeLang].HTTP_STATUS;
      for (const key in statuses) {
         if (statuses[key].code === code) {
            return statuses[key].message;
         }
      }
      return "Unknown Status Code";
   },
};

export default messages;