package com.example.wildcatsden.bookings

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.MainActivity
import com.example.wildcatsden.R
import com.example.wildcatsden.bookings.adapter.BookingAdapter
import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.core.network.ApiService.ApiCallback
import com.example.wildcatsden.core.network.session.UserSession
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.textfield.TextInputEditText
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class BookingsFragment : Fragment() {

    private lateinit var rvBookings: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: View
    private lateinit var tvEmptyMessage: TextView
    private lateinit var adapter: BookingAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_bookings, container, false)
        
        rvBookings = view.findViewById(R.id.rvBookings)
        progressBar = view.findViewById(R.id.progressBar)
        tvEmpty = view.findViewById(R.id.tvEmpty)
        tvEmptyMessage = view.findViewById(R.id.tvEmptyMessage)

        view.findViewById<View>(R.id.btnBrowseVenues)?.setOnClickListener {
            (activity as? MainActivity)?.findViewById<BottomNavigationView>(R.id.bottomNavigation)?.selectedItemId = R.id.nav_venues
        }

        adapter = BookingAdapter(
            items = emptyList(),
            onEditClick = { booking -> showEditDialog(booking) },
            onCancelClick = { booking -> confirmCancelBooking(booking) }
        )
        rvBookings.layoutManager = LinearLayoutManager(requireContext())
        rvBookings.adapter = adapter

        loadBookings()
        
        return view
    }

    private fun loadBookings() {
        val userId = UserSession.getUserId()
        if (userId <= 0) {
            tvEmpty.visibility = View.VISIBLE
            tvEmptyMessage.text = "Please sign in to see your bookings"
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
                            tvEmptyMessage.text = "No Bookings Yet"
                        } else {
                            tvEmpty.visibility = View.GONE
                            adapter.update(list.sortedByDescending { it.bookingId })
                        }

                    } catch (e: Exception) {
                        e.printStackTrace()
                        tvEmpty.visibility = View.VISIBLE
                        tvEmptyMessage.text = "Failed to load bookings"
                    }
                }
            }

            override fun onError(error: String) {
                activity?.runOnUiThread {
                    if (!isAdded) return@runOnUiThread
                    progressBar.visibility = View.GONE
                    tvEmpty.visibility = View.VISIBLE
                    tvEmptyMessage.text = "Error loading bookings"
                }
            }
        })
    }

    private fun confirmCancelBooking(booking: Booking) {
        AlertDialog.Builder(requireContext())
            .setTitle("Cancel Booking")
            .setMessage("Are you sure you want to cancel '${booking.eventName}'?")
            .setPositiveButton("Yes, Cancel") { _, _ ->
                updateBookingStatus(booking.bookingId, "canceled")
            }
            .setNegativeButton("No", null)
            .show()
    }

    private fun updateBookingStatus(bookingId: Long, status: String) {
        progressBar.visibility = View.VISIBLE
        ApiService.updateBookingStatus(bookingId, status, object : ApiCallback {
            override fun onSuccess(response: Any?) {
                activity?.runOnUiThread {
                    progressBar.visibility = View.GONE
                    Toast.makeText(requireContext(), "Booking $status", Toast.LENGTH_SHORT).show()
                    loadBookings()
                }
            }

            override fun onError(error: String) {
                activity?.runOnUiThread {
                    progressBar.visibility = View.GONE
                    Toast.makeText(requireContext(), "Error: $error", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }

    private fun showEditDialog(booking: Booking) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_booking_form, null)
        val titleLabel = dialogView.findViewById<TextView>(R.id.venueNameLabel)
        val etDate = dialogView.findViewById<TextInputEditText>(R.id.etDate)
        val etStartTime = dialogView.findViewById<TextInputEditText>(R.id.etStartTime)
        val etEndTime = dialogView.findViewById<TextInputEditText>(R.id.etEndTime)
        val etPurpose = dialogView.findViewById<TextInputEditText>(R.id.etPurpose)
        val etEventName = dialogView.findViewById<TextInputEditText>(R.id.etEventName)
        val etAttendees = dialogView.findViewById<TextInputEditText>(R.id.etAttendees)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnCancel)
        val btnSubmit = dialogView.findViewById<Button>(R.id.btnSubmit)

        titleLabel.text = "Editing Booking: ${booking.venueName}"
        etDate.setText(booking.date)
        etStartTime.setText(booking.timeSlot?.split("-")?.firstOrNull()?.trim())
        etEndTime.setText(booking.timeSlot?.split("-")?.lastOrNull()?.trim())
        etPurpose.setText(booking.description)
        etEventName.setText(booking.eventName)
        etAttendees.setText(booking.capacity?.toString())

        btnSubmit.text = "Save Changes"

        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        
        // Try to parse existing date for the picker
        booking.date?.let {
            try {
                dateFormat.parse(it)?.let { date ->
                    calendar.time = date
                }
            } catch (e: Exception) {}
        }

        etDate.setOnClickListener {
            DatePickerDialog(requireContext(), { _, year, month, day ->
                calendar.set(year, month, day)
                etDate.setText(dateFormat.format(calendar.time))
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
        }

        etStartTime.setOnClickListener {
            TimePickerDialog(requireContext(), { _, h, m ->
                etStartTime.setText(String.format(Locale.getDefault(), "%02d:%02d", h, m))
            }, 9, 0, true).show()
        }

        etEndTime.setOnClickListener {
            TimePickerDialog(requireContext(), { _, h, m ->
                etEndTime.setText(String.format(Locale.getDefault(), "%02d:%02d", h, m))
            }, 17, 0, true).show()
        }

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnSubmit.setOnClickListener {
            val attendeesInput = etAttendees.text.toString()
            val attendeesCount = attendeesInput.toIntOrNull() ?: 0
            
            // To properly validate capacity, we'd need to fetch venue capacity.
            // For now, let's just use the current capacity if available.
            // If the user hasn't changed it, it's fine.
            
            val updatedData = JSONObject().apply {
                put("bookingId", booking.bookingId)
                put("eventName", etEventName.text.toString())
                put("date", etDate.text.toString())
                
                // Format time to HH:mm:00 for java.sql.Time compatibility
                val startTime = etStartTime.text.toString()
                val formattedTime = if (startTime.count { it == ':' } == 1) "$startTime:00" else startTime
                
                put("timeSlot", formattedTime)
                put("description", etPurpose.text.toString())
                put("capacity", attendeesCount)
                put("eventType", "General")
                put("status", booking.status)
                put("venue", JSONObject().apply { put("venueId", booking.venueId) })
            }
            
            saveBookingChanges(booking.bookingId, updatedData, dialog)
        }

        dialog.show()
    }

    private fun saveBookingChanges(bookingId: Long, data: JSONObject, dialog: AlertDialog) {
        progressBar.visibility = View.VISIBLE
        ApiService.updateBooking(bookingId, data, object : ApiCallback {
            override fun onSuccess(response: Any?) {
                activity?.runOnUiThread {
                    progressBar.visibility = View.GONE
                    dialog.dismiss()
                    Toast.makeText(requireContext(), "Booking updated", Toast.LENGTH_SHORT).show()
                    loadBookings()
                }
            }

            override fun onError(error: String) {
                activity?.runOnUiThread {
                    progressBar.visibility = View.GONE
                    Toast.makeText(requireContext(), "Update failed: $error", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }

    private fun jsonToBooking(obj: JSONObject): Booking {
        val venueObj = obj.optJSONObject("venue")
        
        // Handle date which might be a timestamp number or a string
        val rawDate = obj.opt("date")
        val formattedDate = when (rawDate) {
            is Long -> {
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                sdf.format(Date(rawDate))
            }
            is Int -> {
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                sdf.format(Date(rawDate.toLong() * 1000))
            }
            is JSONArray -> {
                // Handle [year, month, day] format from Spring/Jackson
                val year = rawDate.optInt(0)
                val month = rawDate.optInt(1)
                val day = rawDate.optInt(2)
                if (year != 0) {
                    String.format(Locale.getDefault(), "%04d-%02d-%02d", year, month, day)
                } else {
                    rawDate.toString()
                }
            }
            is String -> {
                val longVal = rawDate.toLongOrNull()
                if (longVal != null) {
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    sdf.format(Date(longVal))
                } else {
                    rawDate
                }
            }
            else -> rawDate?.toString()
        }

        return Booking(
            bookingId = obj.optLong("bookingId", 0L),
            eventName = if (obj.has("eventName")) obj.optString("eventName") else null,
            date = formattedDate,
            timeSlot = if (obj.has("timeSlot")) obj.optString("timeSlot") else null,
            status = if (obj.has("status")) obj.optString("status") else null,
            capacity = if (obj.has("capacity")) obj.optInt("capacity") else null,
            description = if (obj.has("description")) obj.optString("description") else null,
            venueId = venueObj?.optLong("venueId") ?: obj.optLong("venueId"),
            venueName = venueObj?.optString("venueName") ?: obj.optString("venueName")
        )
    }
}
