package com.example.wildcatsden.core.network.session

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONObject

object UserSession {
    private const val PREF_NAME = "UserSession"
    private const val KEY_TOKEN = "auth_token"
    private const val KEY_USER = "current_user"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"
    private const val TAG = "UserSession" // Add this if you want to keep logs

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    fun saveAuthToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getAuthToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveUser(userJson: JSONObject) {
        prefs.edit().putString(KEY_USER, userJson.toString()).apply()
        prefs.edit().putInt(KEY_USER_ID, userJson.optInt("userId", userJson.optInt("id", 0))).apply()
        prefs.edit().putBoolean(KEY_IS_LOGGED_IN, true).apply()
        Log.d(TAG, "User saved: ${userJson.optString("email")}")
    }

    fun getUser(): JSONObject? {
        val userString = prefs.getString(KEY_USER, null)
        return try {
            if (!userString.isNullOrEmpty()) JSONObject(userString) else null
        } catch (e: Exception) {
            null
        }
    }

    fun getUserId(): Int = prefs.getInt(KEY_USER_ID, 0)

    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

    fun getUserType(): String? {
        val user = getUser()
        return user?.optString("userType")?.lowercase()
    }

    fun isAdmin(): Boolean = getUserType() == "admin"

    fun isCustodian(): Boolean = getUserType() == "custodian"

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun logout() {
        clearSession()
        Log.d(TAG, "User logged out")
    }
}