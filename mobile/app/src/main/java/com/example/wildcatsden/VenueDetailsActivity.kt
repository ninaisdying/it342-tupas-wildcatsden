package com.example.wildcatsden

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.wildcatsden.data.Venue
import com.google.android.material.button.MaterialButton
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_venue_details)

        venueId = intent.getIntExtra("venue_id", 0)

        initViews()
        setupListeners()
        fetchVenueDetails()
    }

    private fun initViews() {
        venueTitle = findViewById(R.id.venueTitle)
        venueBuilding = findViewById(R.id.venueBuilding)
        venueCapacity = findViewById(R.id.venueCapacity)
        descriptionText = findViewById(R.id.descriptionText)
        amenitiesGrid = findViewById(R.id.amenitiesGrid)
        custodianName = findViewById(R.id.custodianName)
        custodianPhoto = findViewById(R.id.custodianPhoto)
        mainImage = findViewById(R.id.mainImage)
        btnBookNow = findViewById(R.id.btnBookNow)
        btnShare = findViewById(R.id.btnShare)
        btnBack = findViewById(R.id.btnBack)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnShare.setOnClickListener {
            shareVenueLink()
        }

        btnBookNow.setOnClickListener {
            if (isUserLoggedIn()) {
                showBookingDialog()
            } else {
                showLoginPrompt()
            }
        }
    }

    private fun fetchVenueDetails() {
        lifecycleScope.launch {
            showLoading(true)
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
                    showError("Failed to load venue details")
                }
            } finally {
                withContext(Dispatchers.Main) {
                    showLoading(false)
                }
            }
        }
    }

    private suspend fun fetchVenueFromApi(venueId: Int): Venue? = withContext(Dispatchers.IO) {
        val url = URL("http://10.0.2.2:8080/api/venues/$venueId")
        val connection = url.openConnection() as HttpURLConnection

        return@withContext try {
            connection.requestMethod = "GET"
            connection.connectTimeout = 15000

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().readText()
                parseVenueFromJson(response)
            } else {
                null
            }
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
            image = json.optString("image", ""),
            description = json.optString("description", ""),
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

        val description = venue.description ?: "${venue.venueName} is a versatile space perfect for various events."
        descriptionText.text = description

        custodianName.text = venue.custodianName ?: "Campus Facilities"

        // Load image using Glide or Coil
        // Glide.with(this).load(venue.image).into(mainImage)

        // Display amenities
        displayAmenities(venue.amenities)
    }

    private fun displayAmenities(amenities: List<String>) {
        amenitiesGrid.removeAllViews()

        val visibleAmenities = amenities.take(6)
        visibleAmenities.forEach { amenity ->
            val chip = Chip(this).apply {
                text = amenity
                isCheckable = false
                setChipBackgroundColorResource(R.color.primary)
                setTextColor(resources.getColor(android.R.color.white))
            }
            amenitiesGrid.addView(chip)
        }
    }

    private fun shareVenueLink() {
        val shareUrl = "http://10.0.2.2:8080/venues/venue/$venueId"

        val shareIntent = android.content.Intent().apply {
            action = android.content.Intent.ACTION_SEND
            putExtra(android.content.Intent.EXTRA_TEXT, shareUrl)
            type = "text/plain"
        }

        startActivity(android.content.Intent.createChooser(shareIntent, "Share Venue"))
    }

    private fun showBookingDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_booking_form, null)
        val venueNameLabel = dialogView.findViewById<TextView>(R.id.venueNameLabel)
        val etDate = dialogView.findViewById<TextInputEditText>(R.id.etDate)
        val etStartTime = dialogView.findViewById<TextInputEditText>(R.id.etStartTime)
        val etEndTime = dialogView.findViewById<TextInputEditText>(R.id.etEndTime)
        val etPurpose = dialogView.findViewById<TextInputEditText>(R.id.etPurpose)
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
            .create()

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSubmit.setOnClickListener {
            val date = etDate.text.toString()
            val startTime = etStartTime.text.toString()
            val endTime = etEndTime.text.toString()
            val purpose = etPurpose.text.toString()

            if (date.isNotEmpty() && startTime.isNotEmpty() && endTime.isNotEmpty()) {
                submitBooking(date, startTime, endTime, purpose)
                dialog.dismiss()
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        dialog.show()
    }

    private fun submitBooking(date: String, startTime: String, endTime: String, purpose: String) {
        lifecycleScope.launch {
            try {
                // Submit booking to API
                Toast.makeText(this@VenueDetailsActivity, "Booking submitted successfully!", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@VenueDetailsActivity, "Booking failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun isUserLoggedIn(): Boolean {
        // Check shared preferences or authentication state
        return false // Implement actual auth check
    }

    private fun showLoginPrompt() {
        AlertDialog.Builder(this)
            .setTitle("Login Required")
            .setMessage("Please sign in to book this venue")
            .setPositiveButton("Sign In") { _, _ ->
                // Navigate to login screen
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showLoading(show: Boolean) {
        // Implement loading state
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}