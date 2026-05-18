package com.example.wildcatsden.core.network

import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

object ApiService {
    private const val BASE_URL = "http://10.0.2.2:8080/api" // Use 10.0.2.2 for Android emulator
    private const val TAG = "ApiService"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    private val JSON = "application/json; charset=utf-8".toMediaType()

    // Auth APIs
    fun signIn(email: String, password: String, callback: ApiCallback) {
        val url = "$BASE_URL/auth/signin"
        val json = JSONObject().apply {
            put("email", email)
            put("password", password)
        }

        Log.d(TAG, "=== SIGN IN REQUEST ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Request Body: $json")
        Log.d(TAG, "Email: $email")
        Log.d(TAG, "Password length: ${password.length}")

        val request = Request.Builder()
            .url(url)
            .post(json.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        Log.d(TAG, "Request headers: ${request.headers}")
        executeRequest(request, "signIn", callback)
    }

    // Alternative signIn that takes JSONObject directly (if needed)
    fun signInWithJson(credentials: JSONObject, callback: ApiCallback) {
        val url = "$BASE_URL/auth/signin"

        Log.d(TAG, "=== SIGN IN REQUEST (JSON) ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Request Body: $credentials")

        val request = Request.Builder()
            .url(url)
            .post(credentials.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "signInWithJson", callback)
    }

    fun signUp(userData: JSONObject, callback: ApiCallback) {
        val url = "$BASE_URL/auth/signup"

        Log.d(TAG, "=== SIGN UP REQUEST ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Request Body: ${userData.toString(2)}")
        Log.d(TAG, "Fields present:")
        userData.keys().forEach { key ->
            Log.d(TAG, "  - $key: ${userData.get(key)}")
        }

        val request = Request.Builder()
            .url(url)
            .post(userData.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "signUp", callback)
    }

    // User APIs
    fun getUserById(userId: Int, callback: ApiCallback) {
        val url = "$BASE_URL/users/$userId"

        Log.d(TAG, "=== GET USER BY ID ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User ID: $userId")

        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "getUserById", callback)
    }

    fun getUserByEmail(email: String, callback: ApiCallback) {
        val url = "$BASE_URL/users/email/${email}"

        Log.d(TAG, "=== GET USER BY EMAIL ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Email: $email")

        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "getUserByEmail", callback)
    }

    fun updateUser(userId: Int, userData: JSONObject, callback: ApiCallback) {
        val url = "$BASE_URL/users/$userId"

        Log.d(TAG, "=== UPDATE USER ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User ID: $userId")
        Log.d(TAG, "Update Data: $userData")

        val request = Request.Builder()
            .url(url)
            .put(userData.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "updateUser", callback)
    }

    fun changePassword(userId: Int, newPassword: String, callback: ApiCallback) {
        val url = "$BASE_URL/users/$userId/change-password"
        val json = JSONObject().apply {
            put("password", newPassword)
        }

        Log.d(TAG, "=== CHANGE PASSWORD ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User ID: $userId")
        Log.d(TAG, "Request Body: $json")
        Log.d(TAG, "New password length: ${newPassword.length}")

        val request = Request.Builder()
            .url(url)
            .put(json.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "changePassword", callback)
    }

    fun updateProfilePhoto(userId: Int, imageBytes: ByteArray, fileName: String, callback: ApiCallback) {
        val url = "$BASE_URL/users/$userId/profile-photo"

        val body = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart(
                "photo",
                fileName,
                imageBytes.toRequestBody("image/*".toMediaType())
            )
            .build()

        val request = Request.Builder()
            .url(url)
            .put(body)
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "updateProfilePhoto", callback)
    }

    // Booking APIs
    fun createBooking(bookingData: JSONObject, userId: Int, callback: ApiCallback) {
        val url = "$BASE_URL/bookings?userId=$userId"

        Log.d(TAG, "=== CREATE BOOKING ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User ID: $userId")
        Log.d(TAG, "Booking Data: $bookingData")

        val request = Request.Builder()
            .url(url)
            .post(bookingData.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "createBooking", callback)
    }

    fun getUserBookings(userId: Int, callback: ApiCallback) {
        val url = "$BASE_URL/bookings/user/$userId"

        Log.d(TAG, "=== GET USER BOOKINGS ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User ID: $userId")

        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "getUserBookings", callback)
    }

    fun updateBooking(bookingId: Long, bookingData: JSONObject, callback: ApiCallback) {
        val url = "$BASE_URL/bookings/$bookingId"

        Log.d(TAG, "=== UPDATE BOOKING ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Booking ID: $bookingId")
        Log.d(TAG, "Data: $bookingData")

        val request = Request.Builder()
            .url(url)
            .put(bookingData.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "updateBooking", callback)
    }

    fun updateBookingStatus(bookingId: Long, status: String, callback: ApiCallback) {
        val url = "$BASE_URL/bookings/$bookingId/status"
        val json = JSONObject().apply {
            put("status", status)
        }

        Log.d(TAG, "=== UPDATE BOOKING STATUS ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "Booking ID: $bookingId")
        Log.d(TAG, "Status: $status")

        val request = Request.Builder()
            .url(url)
            .put(json.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "updateBookingStatus", callback)
    }

    // Admin: Create user
    fun createUserByAdmin(userData: JSONObject, callback: ApiCallback) {
        val url = "$BASE_URL/users/create-by-admin"

        Log.d(TAG, "=== CREATE USER BY ADMIN ===")
        Log.d(TAG, "URL: $url")
        Log.d(TAG, "User Data: $userData")

        val request = Request.Builder()
            .url(url)
            .post(userData.toString().toRequestBody(JSON))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .build()

        executeRequest(request, "createUserByAdmin", callback)
    }

    private fun executeRequest(request: Request, apiName: String, callback: ApiCallback) {
        Log.d(TAG, "=== EXECUTING $apiName ===")
        Log.d(TAG, "Full URL: ${request.url}")
        Log.d(TAG, "Method: ${request.method}")
        Log.d(TAG, "Headers: ${request.headers}")

        // Try to log the request body if it exists
        request.body?.let { body ->
            try {
                val buffer = okio.Buffer()
                body.writeTo(buffer)
                Log.d(TAG, "Request body: ${buffer.readUtf8()}")
            } catch (e: Exception) {
                Log.e(TAG, "Could not read request body: ${e.message}")
            }
        }

        val startTime = System.currentTimeMillis()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                val timeElapsed = System.currentTimeMillis() - startTime
                Log.e(TAG, "=== $apiName FAILED ===")
                Log.e(TAG, "Time elapsed: ${timeElapsed}ms")
                Log.e(TAG, "Error type: ${e.javaClass.simpleName}")
                Log.e(TAG, "Error message: ${e.message}")
                e.printStackTrace()
                callback.onError("Network error: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                val timeElapsed = System.currentTimeMillis() - startTime
                Log.d(TAG, "=== $apiName RESPONSE ===")
                Log.d(TAG, "Time elapsed: ${timeElapsed}ms")
                Log.d(TAG, "Response code: ${response.code}")
                Log.d(TAG, "Response message: ${response.message}")
                Log.d(TAG, "Response headers: ${response.headers}")

                response.use {
                    val responseBody = response.body?.string()

                    if (responseBody != null) {
                        if (responseBody.length > 1000) {
                            Log.d(TAG, "Response body (truncated): ${responseBody.substring(0, 500)}...")
                        } else {
                            Log.d(TAG, "Response body: $responseBody")
                        }
                    } else {
                        Log.d(TAG, "Response body: null")
                    }

                    if (!response.isSuccessful) {
                        Log.e(TAG, "=== $apiName ERROR ===")
                        Log.e(TAG, "HTTP Error code: ${response.code}")

                        val errorMessage = try {
                            if (responseBody != null) {
                                // Try to parse as JSON first
                                try {
                                    val json = JSONObject(responseBody)
                                    json.optString("message", responseBody)
                                } catch (e: Exception) {
                                    // If not JSON, return the raw string
                                    responseBody
                                }
                            } else {
                                "HTTP error: ${response.code}"
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Could not parse error response: ${e.message}")
                            "HTTP error: ${response.code}"
                        }
                        callback.onError(errorMessage)
                        return
                    }

                    Log.d(TAG, "=== $apiName SUCCESS ===")

                    if (responseBody.isNullOrEmpty()) {
                        Log.d(TAG, "Success with empty response body")
                        callback.onSuccess(null)
                    } else {
                        try {
                            val json = JSONObject(responseBody)
                            Log.d(TAG, "Success response parsed as JSON")
                            callback.onSuccess(json)
                        } catch (e: Exception) {
                            Log.d(TAG, "Success response is not JSON, returning as string")
                            callback.onSuccess(responseBody)
                        }
                    }
                }
            }
        })
    }

    interface ApiCallback {
        fun onSuccess(response: Any?)
        fun onError(error: String)
    }
}