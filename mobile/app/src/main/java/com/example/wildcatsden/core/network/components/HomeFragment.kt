package com.example.wildcatsden.core.network.components

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.EventsAdapter
import com.example.wildcatsden.MainActivity
import com.example.wildcatsden.R
import com.example.wildcatsden.auth.SignInActivity
import com.example.wildcatsden.core.network.session.UserSession
import com.example.wildcatsden.venues.adapter.VenueCarouselAdapter
import com.google.android.material.bottomnavigation.BottomNavigationView

class HomeFragment : Fragment() {

    private lateinit var headerView: Header
    private lateinit var eventsRecyclerView: RecyclerView
    private lateinit var venueCarouselRecyclerView: RecyclerView
    private lateinit var btnFindVenue: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        
        initViews(view)
        setupHeaderListener()
        setupClickListeners()
        setupVenueCarousel()
        setupEventsGrid()

        // Check if user is already logged in
        if (UserSession.isLoggedIn()) {
            headerView.updateLoginState(true, UserSession.isCustodian())
        }

        return view
    }

    private fun initViews(view: View) {
        headerView = view.findViewById(R.id.headerView)
        eventsRecyclerView = view.findViewById(R.id.recyclerViewEvents)
        venueCarouselRecyclerView = view.findViewById(R.id.recyclerViewVenueCarousel)
        btnFindVenue = view.findViewById(R.id.btnFindVenue)
    }

    private fun setupHeaderListener() {
        headerView.listener = object : Header.HeaderListener {
            override fun onHomeClick() {
                // Already on home
            }

            override fun onVenuesClick() {
                // Switch to Venues tab in Bottom Navigation
                (activity as? MainActivity)?.findViewById<BottomNavigationView>(R.id.bottomNavigation)?.selectedItemId = R.id.nav_venues
            }

            override fun onFaqClick() {
                Toast.makeText(requireContext(), "FAQ clicked", Toast.LENGTH_SHORT).show()
            }

            override fun onSignInClick() {
                // Should not happen if we enforce sign in, but for safety:
                startActivity(Intent(requireContext(), SignInActivity::class.java))
            }

            override fun onSignUpClick() {
                // Handled via SignInActivity
            }

            override fun onLogoutClick() {
                UserSession.logout()
                headerView.updateLoginState(false)
                Toast.makeText(requireContext(), "Logged out successfully", Toast.LENGTH_SHORT).show()
                
                // Redirect to Sign In and clear stack
                val intent = Intent(requireContext(), SignInActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
            }

            override fun onProfileClick() {
                // Switch to Profile tab
                (activity as? MainActivity)?.findViewById<BottomNavigationView>(R.id.bottomNavigation)?.selectedItemId = R.id.nav_profile
            }
        }
    }

    private fun setupClickListeners() {
        btnFindVenue.setOnClickListener {
            // Switch to Venues tab in Bottom Navigation
            (activity as? MainActivity)?.findViewById<BottomNavigationView>(R.id.bottomNavigation)?.selectedItemId = R.id.nav_venues
        }
    }

    private fun setupVenueCarousel() {
        val carouselImages = listOf(
            R.drawable.gym,
            R.drawable.elem,
            R.drawable.covered_court,
            R.drawable.lrac4,
            R.drawable.library,
            R.drawable.lrac5
        )

        venueCarouselRecyclerView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        venueCarouselRecyclerView.adapter = VenueCarouselAdapter(carouselImages)
    }

    private fun setupEventsGrid() {
        val eventImages = listOf(
            R.drawable.event1,
            R.drawable.event2,
            R.drawable.event3,
            R.drawable.event4
        )

        eventsRecyclerView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        eventsRecyclerView.adapter = EventsAdapter(eventImages)
    }
}
