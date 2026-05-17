package com.example.wildcatsden.auth.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.example.wildcatsden.R
import com.example.wildcatsden.core.network.session.UserSession

class ProfileFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_profile, container, false)
        
        val tvName = view.findViewById<TextView>(R.id.tvProfileName)
        val tvEmail = view.findViewById<TextView>(R.id.tvProfileEmail)
        val btnLogout = view.findViewById<Button>(R.id.btnLogout)

        if (UserSession.isLoggedIn()) {
            tvName.text = "User ID: ${UserSession.getUserId()}"
            // We don't have email in session yet, but we can show something
            tvEmail.text = "Logged in as ${if (UserSession.isCustodian()) "Custodian" else "Student"}"
        } else {
            tvName.text = "Not logged in"
            tvEmail.text = ""
        }

        btnLogout.setOnClickListener {
            UserSession.logout()
            // Refresh fragment or redirect
            activity?.recreate()
        }

        return view
    }
}
