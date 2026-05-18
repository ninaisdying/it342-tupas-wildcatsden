package com.example.wildcatsden.auth.components

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.example.wildcatsden.R
import com.example.wildcatsden.auth.SignInActivity
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
            tvEmail.text = "Logged in as ${if (UserSession.isCustodian()) "Custodian" else "Student"}"
        } else {
            tvName.text = "Not logged in"
            tvEmail.text = ""
        }

        btnLogout.setOnClickListener {
            UserSession.logout()
            
            // Redirect to Sign In and clear stack
            val intent = Intent(requireContext(), SignInActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        return view
    }
}
