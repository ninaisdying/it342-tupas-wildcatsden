package com.example.wildcatsden

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.adapter.VenueOverviewAdapter
import com.example.wildcatsden.data.Venue
import com.google.android.material.tabs.TabLayout
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

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
        // Same as in VenuesGridActivity
        emptyList()
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
            val searchMatch = currentSearch.isEmpty() ||
                    venue.venueName?.contains(currentSearch, ignoreCase = true) == true ||
                    venue.venueLocation?.contains(currentSearch, ignoreCase = true) == true ||
                    venue.custodianName?.contains(currentSearch, ignoreCase = true) == true ||
                    venue.amenities?.any { it.contains(currentSearch, ignoreCase = true) } == true

            categoryMatch && searchMatch
        }

        overviewAdapter.submitList(filtered)
    }

    private fun showLoading(show: Boolean) {
        loadingProgress.visibility = if (show) View.VISIBLE else View.GONE
        recyclerView.visibility = if (show) View.GONE else View.VISIBLE
    }
}