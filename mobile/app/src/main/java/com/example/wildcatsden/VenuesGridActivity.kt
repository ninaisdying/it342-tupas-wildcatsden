package com.example.wildcatsden

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.adapter.VenueAdapter
import com.example.wildcatsden.data.Venue
import com.google.android.material.chip.ChipGroup
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL

class VenuesGridActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var venueAdapter: VenueAdapter
    private lateinit var searchView: SearchView
    private lateinit var categoryChipGroup: ChipGroup
    private lateinit var loadingSpinner: ProgressBar
    private lateinit var noResultsText: TextView
    private lateinit var resultsInfo: TextView

    private var venuesList = mutableListOf<Venue>()
    private var currentQuery = ""
    private var currentCategory = "All"

    companion object {
        private const val BASE_URL = "http://10.0.2.2:8080/api/venues" // Use 10.0.2.2 for emulator
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_venues_grid)

        initViews()
        setupRecyclerView()
        setupListeners()
        fetchVenues()
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.recyclerVenues)
        searchView = findViewById(R.id.searchView)
        categoryChipGroup = findViewById(R.id.categoryChipGroup)
        loadingSpinner = findViewById(R.id.loadingSpinner)
        noResultsText = findViewById(R.id.noResultsText)
        resultsInfo = findViewById(R.id.resultsInfo)
    }

    private fun setupRecyclerView() {
        venueAdapter = VenueAdapter { venueId ->
            // Navigate to venue details
            val intent = Intent(this, VenueDetailsActivity::class.java)
            intent.putExtra("venue_id", venueId)
            startActivity(intent)
        }

        recyclerView.layoutManager = GridLayoutManager(this, 2)
        recyclerView.adapter = venueAdapter
    }

    private fun setupListeners() {
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                currentQuery = query ?: ""
                filterVenues()
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                currentQuery = newText ?: ""
                filterVenues()
                return true
            }
        })

        categoryChipGroup.setOnCheckedStateChangeListener { group, checkedIds ->
            when (checkedIds.firstOrNull()) {
                R.id.chipAll -> currentCategory = "All"
                R.id.chipNGE -> currentCategory = "NGE"
                R.id.chipSAL -> currentCategory = "SAL"
                R.id.chipGLE -> currentCategory = "GLE"
                R.id.chipCourt -> currentCategory = "Court"
                R.id.chipACAD -> currentCategory = "ACAD"
                R.id.chipMore -> currentCategory = "More"
            }
            filterVenues()
        }
    }

    private fun fetchVenues() {
        lifecycleScope.launch {
            showLoading(true)
            try {
                val venues = fetchVenuesFromApi()
                withContext(Dispatchers.Main) {
                    venuesList.clear()
                    venuesList.addAll(venues)
                    filterVenues()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    showError("Failed to load venues")
                }
            } finally {
                withContext(Dispatchers.Main) {
                    showLoading(false)
                }
            }
        }
    }

    private suspend fun fetchVenuesFromApi(): List<Venue> = withContext(Dispatchers.IO) {
        val url = URL(BASE_URL)
        val connection = url.openConnection() as HttpURLConnection

        return@withContext try {
            connection.requestMethod = "GET"
            connection.connectTimeout = 15000
            connection.readTimeout = 15000

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().readText()
                parseVenuesFromJson(response)
            } else {
                emptyList()
            }
        } finally {
            connection.disconnect()
        }
    }

    private fun parseVenuesFromJson(jsonString: String): List<Venue> {
        val venues = mutableListOf<Venue>()
        val jsonArray = JSONArray(jsonString)

        for (i in 0 until jsonArray.length()) {
            val jsonObject = jsonArray.getJSONObject(i)
            venues.add(Venue(
                venueId = jsonObject.optInt("venueId", 0),
                venueName = jsonObject.optString("venueName", ""),
                venueLocation = jsonObject.optString("venueLocation", ""),
                venueCapacity = jsonObject.optInt("venueCapacity", 0),
                image = jsonObject.optString("image", ""),
                description = jsonObject.optString("description", ""),
                custodianName = jsonObject.optString("custodianName", ""),
                amenities = jsonObject.optJSONArray("amenities")?.let { arr ->
                    (0 until arr.length()).map { arr.getString(it) }
                } ?: emptyList()
            ))
        }

        return venues
    }

    private fun filterVenues() {
        val knownAreas = listOf("NGE", "SAL", "GLE", "COURT", "ACAD", "LRAC")

        val filtered = venuesList.filter { venue ->
            // Category filter
            val categoryMatch = when {
                currentCategory == "All" -> true
                currentCategory == "More" -> !knownAreas.contains(venue.venueLocation?.uppercase())
                else -> venue.venueLocation?.uppercase() == currentCategory.uppercase()
            }

            // Search filter
            val searchMatch = currentQuery.isEmpty() ||
                    venue.venueName?.contains(currentQuery, ignoreCase = true) == true ||
                    venue.venueLocation?.contains(currentQuery, ignoreCase = true) == true

            categoryMatch && searchMatch
        }

        updateResultsInfo(filtered.size)
        venueAdapter.submitList(filtered)

        noResultsText.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun updateResultsInfo(count: Int) {
        if (currentQuery.isNotEmpty() || currentCategory != "All") {
            resultsInfo.text = "Showing $count venue${if (count != 1) "s" else ""}" +
                    if (currentQuery.isNotEmpty()) " for \"$currentQuery\"" else ""
            resultsInfo.visibility = View.VISIBLE
        } else {
            resultsInfo.visibility = View.GONE
        }
    }

    private fun showLoading(show: Boolean) {
        loadingSpinner.visibility = if (show) View.VISIBLE else View.GONE
        recyclerView.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showError(message: String) {
        // Show error toast or snackbar
        noResultsText.text = message
        noResultsText.visibility = View.VISIBLE
    }
}