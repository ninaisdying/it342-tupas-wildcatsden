package com.example.wildcatsden

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.cardview.widget.CardView
import com.example.wildcatsden.api.UserSession
import org.json.JSONObject

class HomePage : AppCompatActivity(), SignInModal.SignInListener, SignUpModal.SignUpListener {

    private lateinit var headerView: Header
    private lateinit var footerView: FooterView
    private lateinit var eventsRecyclerView: RecyclerView
    private lateinit var btnFindVenue: Button
    private lateinit var btnViewGuide: Button
    private lateinit var btnDiscoverMore: Button
    private lateinit var btnFaq: TextView
    private lateinit var btnFindVenueDiscover: TextView
    private lateinit var btnBrowseVenues: CardView
    private lateinit var btnSubmitRequest: CardView
    private lateinit var btnTrackBooking: CardView
    private lateinit var venueCarouselRecyclerView: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        // Initialize UserSession
        UserSession.init(this)

        setupWindowInsets()
        initViews()
        setupHeaderListener()
        setupClickListeners()
        setupVenueCarousel()
        setupEventsGrid()

        // Check if user is already logged in
        if (UserSession.isLoggedIn()) {
            headerView.updateLoginState(true, UserSession.isCustodian())
        }

        Toast.makeText(this, "HomePage Loaded", Toast.LENGTH_SHORT).show()
    }

    private fun setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    private fun initViews() {
        headerView = findViewById(R.id.headerView)
        footerView = findViewById(R.id.footerView)
        eventsRecyclerView = findViewById(R.id.recyclerViewEvents)
        venueCarouselRecyclerView = findViewById(R.id.recyclerViewVenueCarousel)
        btnFindVenue = findViewById(R.id.btnFindVenue)
        btnViewGuide = findViewById(R.id.btnViewGuide)
        btnDiscoverMore = findViewById(R.id.btnDiscoverMore)
        btnFaq = findViewById(R.id.btnFaq)
        btnFindVenueDiscover = findViewById(R.id.btnFindVenueDiscover)
        btnBrowseVenues = findViewById(R.id.btnBrowseVenues)
        btnSubmitRequest = findViewById(R.id.btnSubmitRequest)
        btnTrackBooking = findViewById(R.id.btnTrackBooking)
    }

    private fun setupHeaderListener() {
        headerView.listener = object : Header.HeaderListener {
            override fun onHomeClick() {
                Toast.makeText(this@HomePage, "Home clicked", Toast.LENGTH_SHORT).show()
            }

            override fun onVenuesClick() {
                Toast.makeText(this@HomePage, "Venues clicked", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@HomePage, VenuesGridActivity::class.java)
                startActivity(intent)
            }

            override fun onFaqClick() {
                Toast.makeText(this@HomePage, "FAQ clicked", Toast.LENGTH_SHORT).show()
            }

            override fun onSignInClick() {
                val signInModal = SignInModal()
                signInModal.show(supportFragmentManager, SignInModal.TAG)
            }

            override fun onSignUpClick() {
                val signUpModal = SignUpModal()
                signUpModal.show(supportFragmentManager, SignUpModal.TAG)
            }

            override fun onLogoutClick() {
                UserSession.logout()
                headerView.updateLoginState(false)
                Toast.makeText(this@HomePage, "Logged out successfully", Toast.LENGTH_SHORT).show()
            }

            override fun onProfileClick() {
                Toast.makeText(this@HomePage, "Profile clicked", Toast.LENGTH_SHORT).show()
                // Navigate to profile page
                // startActivity(Intent(this@HomePage, ProfileActivity::class.java))
            }
        }
    }

    private fun setupClickListeners() {
        btnFindVenue.setOnClickListener {
            Toast.makeText(this, "Find Venue clicked", Toast.LENGTH_SHORT).show()
        }

        btnViewGuide.setOnClickListener {
            Toast.makeText(this, "View Guide clicked", Toast.LENGTH_SHORT).show()
        }

        btnDiscoverMore.setOnClickListener {
            Toast.makeText(this, "Discover More clicked", Toast.LENGTH_SHORT).show()
        }

        btnFaq.setOnClickListener {
            Toast.makeText(this, "FAQ clicked", Toast.LENGTH_SHORT).show()
        }

        btnFindVenueDiscover.setOnClickListener {
            Toast.makeText(this, "Find Venue (Discover) clicked", Toast.LENGTH_SHORT).show()
        }

        btnBrowseVenues.setOnClickListener {
            Toast.makeText(this, "Browse Venues clicked", Toast.LENGTH_SHORT).show()
        }

        btnSubmitRequest.setOnClickListener {
            Toast.makeText(this, "Submit Request clicked", Toast.LENGTH_SHORT).show()
        }

        btnTrackBooking.setOnClickListener {
            Toast.makeText(this, "Track Booking clicked", Toast.LENGTH_SHORT).show()
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

        val layoutManager = LinearLayoutManager(
            this,
            LinearLayoutManager.HORIZONTAL,
            false
        )
        venueCarouselRecyclerView.layoutManager = layoutManager

        val carouselAdapter = VenueCarouselAdapter(carouselImages)
        venueCarouselRecyclerView.adapter = carouselAdapter
    }

    private fun setupEventsGrid() {
        val eventImages = listOf(
            R.drawable.event1,
            R.drawable.event2,
            R.drawable.event3,
            R.drawable.event4
        )

        eventsRecyclerView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        val eventsAdapter = EventsAdapter(eventImages)
        eventsRecyclerView.adapter = eventsAdapter
    }

    // SignInListener callbacks
    override fun onSignInSuccess(user: JSONObject) {
        headerView.updateLoginState(true, user.optString("userType").lowercase() == "custodian")
        Toast.makeText(this, "Welcome, ${user.optString("firstName")}!", Toast.LENGTH_SHORT).show()
    }

    override fun onChangePasswordRequired(user: JSONObject) {
        // Open change password modal
        // You'll need to implement ChangePasswordModal
        Toast.makeText(this, "Please change your password", Toast.LENGTH_SHORT).show()
    }

    override fun onSignUpClick() {
        val signUpModal = SignUpModal()
        signUpModal.show(supportFragmentManager, SignUpModal.TAG)
    }

    // SignUpListener callbacks
    override fun onSignUpSuccess() {
        Toast.makeText(this, "Account created! Please sign in.", Toast.LENGTH_SHORT).show()
        val signInModal = SignInModal()
        signInModal.show(supportFragmentManager, SignInModal.TAG)
    }

    override fun onSignInClick() {
        val signInModal = SignInModal()
        signInModal.show(supportFragmentManager, SignInModal.TAG)
    }

    override fun onModalDismiss() {
        // Optional: Handle modal dismiss
    }
}