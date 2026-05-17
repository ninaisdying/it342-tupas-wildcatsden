package com.example.wildcatsden.core.network.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.TextView
import com.example.wildcatsden.R
import com.example.wildcatsden.venues.VenuesActivity

class FooterView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private lateinit var tvAboutUs: TextView
    private lateinit var tvBlogs: TextView
    private lateinit var tvFaq: TextView
    private lateinit var tvGuide: TextView
    private lateinit var tvPhone: TextView
    private lateinit var tvEmail: TextView
    private lateinit var tvLocation: TextView

    init {
        LayoutInflater.from(context).inflate(R.layout.view_footer, this, true)
        initViews()
        setupClickListeners()
    }

    private fun initViews() {
        tvAboutUs = findViewById(R.id.tvAboutUs)
        tvBlogs = findViewById(R.id.tvBlogs)
        tvFaq = findViewById(R.id.tvFaq)
        tvGuide = findViewById(R.id.tvGuide)
        tvPhone = findViewById(R.id.tvPhone)
        tvEmail = findViewById(R.id.tvEmail)
        tvLocation = findViewById(R.id.tvLocation)
    }

    private fun setupClickListeners() {
        //temporary links!

        tvBlogs.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://cit.edu/blogs/"))
            context.startActivity(intent)
        }

        tvFaq.setOnClickListener {
            context.startActivity(Intent(context, VenuesActivity::class.java))
        }

        tvGuide.setOnClickListener {
            context.startActivity(Intent(context, VenuesActivity::class.java))
        }

        tvPhone.setOnClickListener {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:1234567890"))
            context.startActivity(intent)
        }

        tvEmail.setOnClickListener {
            val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:WildcatDen@email.com"))
            context.startActivity(intent)
        }
    }
}