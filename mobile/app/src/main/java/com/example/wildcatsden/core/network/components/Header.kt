package com.example.wildcatsden.core.network.components

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.isVisible
import com.example.wildcatsden.R

class Header @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private lateinit var btnHome: TextView
    private lateinit var btnVenues: TextView
    private lateinit var btnFaq: TextView
    private lateinit var btnSignIn: Button
    private lateinit var btnSignUp: Button
    private lateinit var btnLogout: Button
    private lateinit var btnProfile: ImageView
    private lateinit var layoutAuthButtons: LinearLayout
    private lateinit var layoutUserButtons: LinearLayout
    private lateinit var tvBrandName: TextView
    private lateinit var logoImage: ImageView

    private var isLoggedIn = false
    private var isCustodian = false

    interface HeaderListener {
        fun onHomeClick()
        fun onVenuesClick()
        fun onFaqClick()
        fun onSignInClick()
        fun onSignUpClick()
        fun onLogoutClick()
        fun onProfileClick()
    }

    var listener: HeaderListener? = null

    init {
        LayoutInflater.from(context).inflate(R.layout.view_header, this, true)
        initViews()
        setupClickListeners()
    }

    private fun initViews() {
        btnHome = findViewById(R.id.btnHome)
        btnVenues = findViewById(R.id.btnVenues)
        btnFaq = findViewById(R.id.btnFaq)
        btnSignIn = findViewById(R.id.btnSignIn)
        btnSignUp = findViewById(R.id.btnSignUp)
        btnLogout = findViewById(R.id.btnLogout)
        btnProfile = findViewById(R.id.btnProfile)
        layoutAuthButtons = findViewById(R.id.layoutAuthButtons)
        layoutUserButtons = findViewById(R.id.layoutUserButtons)
        tvBrandName = findViewById(R.id.tvBrandName)
        logoImage = findViewById(R.id.logoImage)

        tvBrandName.setOnClickListener {
            listener?.onHomeClick()
        }

        logoImage.setOnClickListener {
            listener?.onHomeClick()
        }
    }

    private fun setupClickListeners() {
        btnHome.setOnClickListener { listener?.onHomeClick() }
        btnVenues.setOnClickListener { listener?.onVenuesClick() }
        btnFaq.setOnClickListener { listener?.onFaqClick() }

        btnSignIn.setOnClickListener {
            listener?.onSignInClick()
        }

        btnSignUp.setOnClickListener {
            listener?.onSignUpClick()
        }

        btnLogout.setOnClickListener { listener?.onLogoutClick() }
        btnProfile.setOnClickListener { listener?.onProfileClick() }
    }

    fun updateLoginState(loggedIn: Boolean, isCustodianUser: Boolean = false) {
        isLoggedIn = loggedIn
        isCustodian = isCustodianUser

        layoutAuthButtons.isVisible = !loggedIn
        layoutUserButtons.isVisible = loggedIn

        if (loggedIn) {
            btnVenues.text = if (isCustodian) "Manage Venues" else "Venues"
        }
    }

}