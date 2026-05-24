package com.example.wildcatsden.venues

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.example.wildcatsden.R
import com.example.wildcatsden.auth.SignInActivity
import com.example.wildcatsden.core.network.ApiService
import com.google.android.material.button.MaterialButton
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.textfield.TextInputEditText
import com.example.wildcatsden.core.network.session.UserSession
import com.example.wildcatsden.core.utils.ImageUtils
import com.example.wildcatsden.venues.data.Venue
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

class VenueDetailsActivity : AppCompatActivity() {

    private lateinit var venueTitle: TextView
    private lateinit var venueBuilding: TextView
    private lateinit var venueCapacity: TextView
    private lateinit var descriptionText: TextView
    private lateinit var amenitiesGrid: ChipGroup
    private lateinit var custodianName: TextView
    private lateinit var custodianPhoto: ImageView
    private lateinit var mainImage: ImageView
    private lateinit var btnBookNow: MaterialButton
    private lateinit var btnShare: ImageButton
    private lateinit var btnBack: ImageButton


    private var venueId: Int = 0
    private var venueData: Venue? = null

    private val job = Job()
    private val coroutineScope = CoroutineScope(Dispatchers.Main + job)

    companion object {
        private const val BASE_URL = "http://10.0.2.2:8080/api/venues"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_venue_details)

        venueId = intent.getIntExtra("venue_id", 0)

        initViews()
        setupListeners()
        fetchVenueDetails()
    }

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }

    private fun initViews() {
        btnBack = findViewById(R.id.btnBack)
        btnBookNow = findViewById(R.id.btnBook)
        btnShare = findViewById(R.id.btnShare)

        // These are inside the included view_venue_description.xml
        val descriptionView = findViewById<View>(R.id.venue_description_view) ?: return
        venueTitle = descriptionView.findViewById(R.id.venueTitle)
        venueBuilding = descriptionView.findViewById(R.id.venueBuilding)
        venueCapacity = descriptionView.findViewById(R.id.venueCapacity)
        descriptionText = descriptionView.findViewById(R.id.descriptionText)
        amenitiesGrid = descriptionView.findViewById(R.id.amenitiesGrid)
        custodianName = descriptionView.findViewById(R.id.custodianName)
        custodianPhoto = descriptionView.findViewById(R.id.custodianPhoto)
        mainImage = findViewById(R.id.mainImage)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnShare.setOnClickListener {
            shareVenueLink()
        }

        btnBookNow.setOnClickListener {
            if (UserSession.isLoggedIn()) {
                showBookingDialog()
            } else {
                showLoginPrompt()
            }
        }
    }

    private fun fetchVenueDetails() {
        coroutineScope.launch {
            try {
                val venue = fetchVenueFromApi(venueId)
                withContext(Dispatchers.Main) {
                    if (venue != null) {
                        venueData = venue
                        displayVenueData(venue)
                    } else {
                        showError("Venue not found")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    showError("Failed to load venue details: ${e.message}")
                }
            }
        }
    }

    private suspend fun fetchVenueFromApi(venueId: Int): Venue? = withContext(Dispatchers.IO) {
        val url = URL("$BASE_URL/$venueId")
        val connection = url.openConnection() as HttpURLConnection

        return@withContext try {
            connection.requestMethod = "GET"
            connection.connectTimeout = 15000
            connection.readTimeout = 15000

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().readText()
                parseVenueFromJson(response)
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            connection.disconnect()
        }
    }

    private fun parseVenueFromJson(jsonString: String): Venue {
        val json = JSONObject(jsonString)

        return Venue(
            venueId = json.optInt("venueId", 0),
            venueName = json.optString("venueName", ""),
            venueLocation = json.optString("venueLocation", ""),
            venueCapacity = json.optInt("venueCapacity", 0),
            image = json.optString("image", json.optString("venueImage", "")),
            description = json.optString("description", json.optString("venueDescription", "")),
            custodianId = json.optInt("custodianId", 0),
            custodianName = json.optString("custodianName", ""),
            amenities = json.optJSONArray("amenities")?.let { arr ->
                (0 until arr.length()).map { arr.getString(it) }
            } ?: emptyList()
        )
    }

    private fun displayVenueData(venue: Venue) {
        venueTitle.text = venue.venueName
        venueBuilding.text = venue.venueLocation ?: "University Campus"
        venueCapacity.text = "${venue.venueCapacity ?: 0} people"

        val description = venue.description?.takeIf { it.isNotEmpty() }
            ?: "${venue.venueName} is a versatile space perfect for various events and activities."
        descriptionText.text = description

        custodianName.text = venue.custodianName ?: "Campus Facilities"

        val resolved = ImageUtils.resolveImageUrl(venue.image)
        android.util.Log.d("VenueDetails", "Resolved image URL: $resolved")
        Glide.with(this)
            .load(resolved)
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_placeholder)
            .into(mainImage)

        displayAmenities(venue.amenities)
    }

    private fun displayAmenities(amenities: List<String>) {
        amenitiesGrid.removeAllViews()

        if (amenities.isEmpty()) {
            val chip = Chip(this).apply {
                text = "No amenities listed"
                isCheckable = false
                isEnabled = false
            }
            amenitiesGrid.addView(chip)
            return
        }

        amenities.forEach { amenity ->
            val chip = Chip(this).apply {
                text = amenity
                isCheckable = false
                chipBackgroundColor = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.primary))
                setTextColor(ContextCompat.getColor(context, android.R.color.white))
            }
            amenitiesGrid.addView(chip)
        }
    }

    private fun shareVenueLink() {
        val shareUrl = "$BASE_URL/$venueId"

        val shareIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, shareUrl)
            type = "text/plain"
        }

        startActivity(Intent.createChooser(shareIntent, "Share Venue"))
    }

    private fun showBookingDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_booking_form, null)
        val venueNameLabel = dialogView.findViewById<TextView>(R.id.venueNameLabel)
        val etDate = dialogView.findViewById<TextInputEditText>(R.id.etDate)
        val etStartTime = dialogView.findViewById<TextInputEditText>(R.id.etStartTime)
        val etEndTime = dialogView.findViewById<TextInputEditText>(R.id.etEndTime)
        val etPurpose = dialogView.findViewById<TextInputEditText>(R.id.etPurpose)
        val etEventName = dialogView.findViewById<TextInputEditText>(R.id.etEventName)
        val etAttendees = dialogView.findViewById<TextInputEditText>(R.id.etAttendees)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnCancel)
        val btnSubmit = dialogView.findViewById<Button>(R.id.btnSubmit)

        venueNameLabel.text = "Booking: ${venueData?.venueName}"

        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())

        etDate.setOnClickListener {
            DatePickerDialog(this, { _, year, month, day ->
                calendar.set(year, month, day)
                etDate.setText(dateFormat.format(calendar.time))
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
        }

        etStartTime.setOnClickListener {
            TimePickerDialog(this, { _, hour, minute ->
                calendar.set(Calendar.HOUR_OF_DAY, hour)
                calendar.set(Calendar.MINUTE, minute)
                etStartTime.setText(timeFormat.format(calendar.time))
            }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show()
        }

        etEndTime.setOnClickListener {
            TimePickerDialog(this, { _, hour, minute ->
                calendar.set(Calendar.HOUR_OF_DAY, hour)
                calendar.set(Calendar.MINUTE, minute)
                etEndTime.setText(timeFormat.format(calendar.time))
            }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show()
        }

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSubmit.setOnClickListener {
            val date = etDate.text.toString()
            val startTime = etStartTime.text.toString()
            val endTime = etEndTime.text.toString()
            val purpose = etPurpose.text.toString()
            val eventNameInput = etEventName.text.toString()
            val attendeesInput = etAttendees.text.toString()
            val attendeesCount = attendeesInput.toIntOrNull() ?: 0
            val venueCapacityVal = venueData?.venueCapacity ?: 0

            when {
                date.isEmpty() -> Toast.makeText(this, "Please select a date", Toast.LENGTH_SHORT).show()
                startTime.isEmpty() -> Toast.makeText(this, "Please select start time", Toast.LENGTH_SHORT).show()
                endTime.isEmpty() -> Toast.makeText(this, "Please select end time", Toast.LENGTH_SHORT).show()
                eventNameInput.isEmpty() -> Toast.makeText(this, "Please enter event name", Toast.LENGTH_SHORT).show()
                attendeesInput.isEmpty() -> Toast.makeText(this, "Please enter attendees", Toast.LENGTH_SHORT).show()
                attendeesCount > venueCapacityVal -> {
                    Toast.makeText(this, "Attendees cannot exceed venue capacity ($venueCapacityVal)", Toast.LENGTH_LONG).show()
                }
                else -> {
                    submitBooking(date, startTime, endTime, purpose, eventNameInput, attendeesInput)
                    dialog.dismiss()
                }
            }
        }

        dialog.show()
    }

    private fun submitBooking(date: String, startTime: String, endTime: String, purpose: String, eventNameInput: String, attendeesInput: String) {
        coroutineScope.launch {
            try {
                // Build booking JSON to match web client
                val bookingJson = JSONObject().apply {
                    put("eventName", if (eventNameInput.isNotBlank()) eventNameInput else "Booking: ${venueData?.venueName}")
                    put("date", date)
                    // timeSlot uses HH:mm:ss expected by backend
                    put("timeSlot", "$startTime:00")
                    put("capacity", try { attendeesInput.toInt() } catch (e: Exception) { 1 })
                    put("description", purpose)
                    put("eventType", "General")
                    put("status", "pending")
                    // venue object
                    put("venue", JSONObject().apply { put("venueId", venueData?.venueId ?: venueId) })
                }

                val userId = UserSession.getUserId()

                ApiService.createBooking(bookingJson, userId, object : com.example.wildcatsden.core.network.ApiService.ApiCallback {
                    override fun onSuccess(response: Any?) {
                        runOnUiThread {
                            try {
                                Toast.makeText(this@VenueDetailsActivity,
                                    "Booking confirmed for ${venueData?.venueName} on $date",
                                    Toast.LENGTH_LONG).show()
                            } catch (e: Exception) {
                                Toast.makeText(this@VenueDetailsActivity, "Booking succeeded", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }

                    override fun onError(error: String) {
                        runOnUiThread {
                            Toast.makeText(this@VenueDetailsActivity, "Booking failed: $error", Toast.LENGTH_LONG).show()
                        }
                    }
                })
            } catch (e: Exception) {
                Toast.makeText(this@VenueDetailsActivity, "Booking failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showLoginPrompt() {
        AlertDialog.Builder(this)
            .setTitle("Login Required")
            .setMessage("Please sign in to book this venue")
            .setPositiveButton("Sign In") { _, _ ->
                val intent = Intent(this, SignInActivity::class.java)
                startActivity(intent)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}