package com.example.wildcatsden.events.repository

import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.events.models.Event
import org.json.JSONArray
import org.json.JSONObject

class EventRepository {

    fun fetchCITUEvents(
        onSuccess: (List<Event>) -> Unit,
        onError: (String) -> Unit
    ) {
        ApiService.getEvents(object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                val events = parseEvents(response)
                onSuccess(events)
            }

            override fun onError(error: String) {
                onError(error)
            }
        })
    }

    private fun parseEvents(response: Any?): List<Event> {
        if (response == null) return emptyList()

        val jsonArray = when (response) {
            is JSONArray -> response
            is JSONObject -> {
                when {
                    response.has("data") -> response.optJSONArray("data") ?: JSONArray()
                    response.has("events") -> response.optJSONArray("events") ?: JSONArray()
                    else -> JSONArray().put(response)
                }
            }
            is String -> parseStringAsJsonArray(response)
            else -> JSONArray()
        }

        val events = mutableListOf<Event>()
        for (i in 0 until jsonArray.length()) {
            val item = jsonArray.optJSONObject(i) ?: continue
            events.add(mapEventItem(item))
        }
        return events
    }

    private fun parseStringAsJsonArray(rawJson: String): JSONArray {
        return try {
            JSONArray(rawJson)
        } catch (e: Exception) {
            try {
                val jsonObject = JSONObject(rawJson)
                JSONArray().put(jsonObject)
            } catch (ignored: Exception) {
                JSONArray()
            }
        }
    }

    private fun mapEventItem(item: JSONObject): Event {
        val coverPhoto = item.optString("coverPhoto").ifEmpty {
            item.optJSONObject("cover")?.optString("source", "") ?: ""
        }

        val placeName = item.optString("place").ifEmpty {
            item.optJSONObject("place")?.optString("name", "") ?: ""
        }

        return Event(
            id = item.optString("id", ""),
            name = item.optString("name", ""),
            description = item.optString("description", ""),
            coverPhoto = coverPhoto,
            startTime = item.optString("start_time", item.optString("startTime", "")),
            endTime = item.optString("end_time", item.optString("endTime", "")),
            place = placeName,
            attendingCount = item.optInt("attending_count", item.optInt("attendingCount", 0))
        )
    }
}
