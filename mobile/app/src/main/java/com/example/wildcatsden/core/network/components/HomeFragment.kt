package com.example.wildcatsden.core.network.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.EventsAdapter
import com.example.wildcatsden.MainActivity
import com.example.wildcatsden.R
import com.example.wildcatsden.auth.components.SignInModal
import com.example.wildcatsden.auth.components.SignUpModal
import com.example.wildcatsden.core.network.session.UserSession
import com.example.wildcatsden.venues.adapter.VenueCarouselAdapter
import com.google.android.material.bottomnavigation.BottomNavigationView
import org.json.JSONObject

class HomeFragment : Fragment(), SignInModal.SignInListener, SignUpModal.SignUpListener {

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
                val signInModal = SignInModal()
                signInModal.show(childFragmentManager, SignInModal.TAG)
            }

            override fun onSignUpClick() {
                val signUpModal = SignUpModal()
                signUpModal.show(childFragmentManager, SignUpModal.TAG)
            }

            override fun onLogoutClick() {
                UserSession.logout()
                headerView.updateLoginState(false)
                Toast.makeText(requireContext(), "Logged out successfully", Toast.LENGTH_SHORT).show()
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

    // SignInListener callbacks
    override fun onSignInSuccess(user: JSONObject) {
        headerView.updateLoginState(true, user.optString("userType").lowercase() == "custodian")
        Toast.makeText(requireContext(), "Welcome, ${user.optString("firstName")}!", Toast.LENGTH_SHORT).show()
    }

    override fun onChangePasswordRequired(user: JSONObject) {
        Toast.makeText(requireContext(), "Please change your password", Toast.LENGTH_SHORT).show()
    }

    override fun onSignUpClick() {
        val signUpModal = SignUpModal()
        signUpModal.show(childFragmentManager, SignUpModal.TAG)
    }

    // SignUpListener callbacks
    override fun onSignUpSuccess() {
        Toast.makeText(requireContext(), "Account created! Please sign in.", Toast.LENGTH_SHORT).show()
        val signInModal = SignInModal()
        signInModal.show(childFragmentManager, SignInModal.TAG)
    }

    override fun onSignInClick() {
        val signInModal = SignInModal()
        signInModal.show(childFragmentManager, SignInModal.TAG)
    }

    override fun onModalDismiss() {}
}
