package com.example.wildcatsden.bookings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.R
import com.example.wildcatsden.bookings.adapter.BookingAdapter
import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.core.network.ApiService.ApiCallback
import com.example.wildcatsden.core.network.session.UserSession
import org.json.JSONArray
import org.json.JSONObject

class BookingsFragment : Fragment() {

    private lateinit var rvBookings: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var adapter: BookingAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_bookings, container, false)
        
        rvBookings = view.findViewById(R.id.rvBookings)
        progressBar = view.findViewById(R.id.progressBar)
        tvEmpty = view.findViewById(R.id.tvEmpty)

        adapter = BookingAdapter(emptyList())
        rvBookings.layoutManager = LinearLayoutManager(requireContext())
        rvBookings.adapter = adapter

        loadBookings()
        
        return view
    }

    private fun loadBookings() {
        val userId = UserSession.getUserId()
        if (userId <= 0) {
            tvEmpty.visibility = View.VISIBLE
            tvEmpty.text = "Please sign in to see your bookings"
            return
        }

        progressBar.visibility = View.VISIBLE
        tvEmpty.visibility = View.GONE

        ApiService.getUserBookings(userId, object : ApiCallback {
            override fun onSuccess(response: Any?) {
                activity?.runOnUiThread {
                    if (!isAdded) return@runOnUiThread
                    progressBar.visibility = View.GONE

                    try {
                        val list = mutableListOf<Booking>()

                        when (response) {
                            is JSONObject -> {
                                list.add(jsonToBooking(response))
                            }
                            is String -> {
                                val arr = JSONArray(response)
                                for (i in 0 until arr.length()) {
                                    list.add(jsonToBooking(arr.getJSONObject(i)))
                                }
                            }
                            is JSONArray -> {
                                for (i in 0 until response.length()) {
                                    list.add(jsonToBooking(response.getJSONObject(i)))
                                }
                            }
                        }

                        if (list.isEmpty()) {
                            tvEmpty.visibility = View.VISIBLE
                            tvEmpty.text = "No bookings yet"
                        } else {
                            tvEmpty.visibility = View.GONE
                            adapter.update(list)
                        }

                    } catch (e: Exception) {
                        e.printStackTrace()
                        tvEmpty.visibility = View.VISIBLE
                        tvEmpty.text = "Failed to load bookings"
                    }
                }
            }

            override fun onError(error: String) {
                activity?.runOnUiThread {
                    if (!isAdded) return@runOnUiThread
                    progressBar.visibility = View.GONE
                    tvEmpty.visibility = View.VISIBLE
                    tvEmpty.text = "Error loading bookings: $error"
                }
            }
        })
    }

    private fun jsonToBooking(obj: JSONObject): Booking {
        val venueObj = obj.optJSONObject("venue")
        return Booking(
            bookingId = obj.optLong("bookingId", 0L),
            eventName = if (obj.has("eventName")) obj.optString("eventName") else null,
            date = if (obj.has("date")) obj.optString("date") else null,
            timeSlot = if (obj.has("timeSlot")) obj.optString("timeSlot") else null,
            status = if (obj.has("status")) obj.optString("status") else null,
            capacity = if (obj.has("capacity")) obj.optInt("capacity") else null,
            description = if (obj.has("description")) obj.optString("description") else null,
            venueId = venueObj?.optLong("venueId") ?: obj.optLong("venueId"),
            venueName = venueObj?.optString("venueName") ?: obj.optString("venueName")
        )
    }
}
