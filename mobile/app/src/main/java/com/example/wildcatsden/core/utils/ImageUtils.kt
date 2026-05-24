package com.example.wildcatsden.core.utils

import android.util.Base64

object ImageUtils {
    private const val BASE_URL = "http://10.0.2.2:8080"

    fun resolveImageUrl(rawUrl: String?): String? {
        if (rawUrl.isNullOrEmpty()) return null

        return when {
            rawUrl.contains("fbcdn.net") || rawUrl.contains("facebook.com") -> {
                val encodedUrl = Base64.encodeToString(rawUrl.toByteArray(Charsets.UTF_8), Base64.URL_SAFE or Base64.NO_WRAP)
                "$BASE_URL/api/files/proxy?url=$encodedUrl"
            }
            rawUrl.startsWith("http") -> {
                if (rawUrl.contains("localhost") || rawUrl.contains("127.0.0.1")) {
                    rawUrl.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2")
                } else rawUrl
            }
            rawUrl.startsWith("/") -> BASE_URL + rawUrl
            else -> "$BASE_URL/$rawUrl"
        }
    }
}
