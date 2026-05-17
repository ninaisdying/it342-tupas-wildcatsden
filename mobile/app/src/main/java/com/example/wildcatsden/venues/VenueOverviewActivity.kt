package com.example.wildcatsden.venues

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.R
import com.example.wildcatsden.venues.adapter.VenueOverviewAdapter
import com.example.wildcatsden.venues.data.Venue
import android.util.Log
import com.google.android.material.tabs.TabLayout
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class VenueOverviewActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var overviewAdapter: VenueOverviewAdapter
    private lateinit var searchInput: TextInputEditText
    private lateinit var categoryTabs: TabLayout
    private lateinit var loadingProgress: ProgressBar

    private var venuesList = mutableListOf<Venue>()
    private var currentSearch = ""
    private var currentCategory = "All"

    private val categories = listOf("All", "NGE", "SAL", "GLE", "Court", "ACAD", "More")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_venue_overview)

        initViews()
        setupTabs()
        setupSearch()
        setupRecyclerView()
        fetchVenues()
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.recyclerVenuesOverview)
        searchInput = findViewById(R.id.searchInput)
        categoryTabs = findViewById(R.id.categoryTabs)
        loadingProgress = findViewById(R.id.loadingProgress)
    }

    private fun setupTabs() {
        categories.forEach { category ->
            categoryTabs.addTab(categoryTabs.newTab().setText(category))
        }

        categoryTabs.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                currentCategory = tab?.text.toString()
                filterVenues()
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }

    private fun setupSearch() {
        searchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                currentSearch = s.toString()
                filterVenues()
            }
        })
    }

    private fun setupRecyclerView() {
        overviewAdapter = VenueOverviewAdapter()
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        recyclerView.adapter = overviewAdapter
    }

    private fun fetchVenues() {
        lifecycleScope.launch {
            showLoading(true)
            try {
                val venues = fetchVenuesFromApi()
                Log.d("VenueOverview", "Fetched ${venues.size} venues from API")
                withContext(Dispatchers.Main) {
                    venuesList.clear()
                    venuesList.addAll(venues)
                    filterVenues()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                withContext(Dispatchers.Main) {
                    showLoading(false)
                }
            }
        }
    }

    private suspend fun fetchVenuesFromApi(): List<Venue> = withContext(Dispatchers.IO) {
        val url = URL("http://10.0.2.2:8080/api/venues")
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
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        } finally {
            connection.disconnect()
        }
    }

    private fun parseVenuesFromJson(jsonString: String): List<Venue> {
        val venues = mutableListOf<Venue>()
        try {
            val jsonArray = JSONArray(jsonString)
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                venues.add(Venue(
                    venueId = jsonObject.optInt("venueId", 0),
                    venueName = jsonObject.optString("venueName", ""),
                    venueLocation = jsonObject.optString("venueLocation", ""),
                    venueCapacity = jsonObject.optInt("venueCapacity", 0),
                    image = jsonObject.optString("image", jsonObject.optString("venueImage", "")),
                    description = jsonObject.optString("description", jsonObject.optString("venueDescription", "")),
                    custodianName = jsonObject.optString("custodianName", ""),
                    amenities = jsonObject.optJSONArray("amenities")?.let { arr ->
                        (0 until arr.length()).map { arr.getString(it) }
                    } ?: emptyList()
                ))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return venues
    }

    private fun filterVenues() {
        val knownAreas = listOf("NGE", "SAL", "GLE", "COURT", "ACAD", "LRAC")

        val filtered = venuesList.filter { venue ->
            // Category filter
            val categoryMatch = when {
                currentCategory == "All" -> true
                currentCategory == "More" -> !knownAreas.contains(venue.venueLocation?.uppercase() ?: "")
                else -> venue.venueLocation?.uppercase() == currentCategory.uppercase()
            }

            // Search filter
            val searchMatch = currentSearch.isEmpty() ||
                    venue.venueName.contains(currentSearch, ignoreCase = true) ||
                    (venue.venueLocation?.contains(currentSearch, ignoreCase = true) == true) ||
                    (venue.custodianName?.contains(currentSearch, ignoreCase = true) == true) ||
                    venue.amenities.any { it.contains(currentSearch, ignoreCase = true) }

            categoryMatch && searchMatch
        }

        Log.d("VenueOverview", "Filtered to ${filtered.size} venues (Total: ${venuesList.size})")
        overviewAdapter.submitList(filtered)
    }

    private fun showLoading(show: Boolean) {
        loadingProgress.visibility = if (show) View.VISIBLE else View.GONE
        recyclerView.visibility = if (show) View.GONE else View.VISIBLE
    }
}