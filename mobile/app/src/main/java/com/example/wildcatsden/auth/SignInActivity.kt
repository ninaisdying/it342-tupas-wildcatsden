package com.example.wildcatsden.auth

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.wildcatsden.MainActivity
import com.example.wildcatsden.R
import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.core.network.session.UserSession
import org.json.JSONObject

class SignInActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnContinue: Button
    private lateinit var tvSignUp: TextView
    private lateinit var tvError: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize UserSession
        UserSession.init(this)
        
        // Check if already logged in
        if (UserSession.isLoggedIn()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_signin)

        initViews()
        setupClickListeners()
    }

    private fun initViews() {
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnContinue = findViewById(R.id.btnContinue)
        tvSignUp = findViewById(R.id.tvSignUp)
        tvError = findViewById(R.id.tvError)
    }

    private fun setupClickListeners() {
        btnContinue.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (validateInput(email, password)) {
                performSignIn(email, password)
            }
        }

        tvSignUp.setOnClickListener {
            startActivity(Intent(this, SignUpActivity::class.java))
        }
    }

    private fun validateInput(email: String, password: String): Boolean {
        tvError.visibility = View.GONE

        when {
            email.isEmpty() -> {
                showError("Email is required")
                return false
            }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                showError("Please enter a valid email address")
                return false
            }
            password.isEmpty() -> {
                showError("Password is required")
                return false
            }
        }
        return true
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun performSignIn(email: String, password: String) {
        btnContinue.isEnabled = false
        btnContinue.text = "Signing In..."

        ApiService.signIn(email, password, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                Handler(Looper.getMainLooper()).post {
                    try {
                        when (response) {
                            is JSONObject -> {
                                val token = response.optString("token")
                                val userJson = response.optJSONObject("user")

                                if (userJson != null) {
                                    if (token.isNotEmpty()) {
                                        UserSession.saveAuthToken(token)
                                    }
                                    UserSession.saveUser(userJson)

                                    Toast.makeText(this@SignInActivity, "Login successful", Toast.LENGTH_SHORT).show()
                                    startActivity(Intent(this@SignInActivity, MainActivity::class.java))
                                    finish()
                                } else {
                                    showError("Invalid response: no user data")
                                    resetButton()
                                }
                            }
                            else -> {
                                showError("Unexpected response type")
                                resetButton()
                            }
                        }
                    } catch (e: Exception) {
                        showError("Error parsing response: ${e.message}")
                        resetButton()
                    }
                }
            }

            override fun onError(error: String) {
                Handler(Looper.getMainLooper()).post {
                    showError(error)
                    resetButton()
                }
            }
        })
    }

    private fun resetButton() {
        btnContinue.isEnabled = true
        btnContinue.text = "Continue"
    }
}