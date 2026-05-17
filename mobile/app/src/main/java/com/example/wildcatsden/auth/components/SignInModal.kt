package com.example.wildcatsden.auth.components

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.example.wildcatsden.R
import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.core.network.session.UserSession
import org.json.JSONObject

class SignInModal : DialogFragment() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnContinue: Button
    private lateinit var tvSignUp: TextView
    private lateinit var tvError: TextView
    private lateinit var btnClose: TextView

    private var listener: SignInListener? = null

    interface SignInListener {
        fun onSignInSuccess(user: JSONObject)
        fun onSignUpClick()
        fun onModalDismiss()
        fun onChangePasswordRequired(user: JSONObject)
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        listener = parentFragment as? SignInListener ?: context as? SignInListener
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val builder = AlertDialog.Builder(requireActivity())
        val inflater = requireActivity().layoutInflater
        val view = inflater.inflate(R.layout.modal_signin, null)

        initViews(view)
        setupClickListeners()

        builder.setView(view)
        return builder.create()
    }

    private fun initViews(view: View) {
        etEmail = view.findViewById(R.id.etEmail)
        etPassword = view.findViewById(R.id.etPassword)
        btnContinue = view.findViewById(R.id.btnContinue)
        tvSignUp = view.findViewById(R.id.tvSignUp)
        tvError = view.findViewById(R.id.tvError)
        btnClose = view.findViewById(R.id.btnClose)
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
            dismiss()
            listener?.onSignUpClick()
        }

        btnClose.setOnClickListener {
            dismiss()
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
        Log.d("SignInModal", "=== PERFORM SIGN IN ===")
        Log.d("SignInModal", "Email: $email")

        btnContinue.isEnabled = false
        btnContinue.text = "Signing In..."

        // Use the correct signIn method that takes email and password strings
        ApiService.signIn(email, password, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                Log.d("SignInModal", "SignIn success: $response")
                Handler(Looper.getMainLooper()).post {
                    try {
                        when (response) {
                            is JSONObject -> {
                                val token = response.optString("token")
                                val userJson = response.optJSONObject("user")

                                if (userJson != null) {
                                    // Save session
                                    if (token.isNotEmpty()) {
                                        UserSession.saveAuthToken(token)
                                    }
                                    UserSession.saveUser(userJson)

                                    // Check if first login
                                    if (userJson.optBoolean("firstLogin", false)) {
                                        Toast.makeText(context, "You must change your password", Toast.LENGTH_SHORT).show()
                                        dismiss()
                                        listener?.onChangePasswordRequired(userJson)
                                    } else {
                                        Toast.makeText(context, "Login successful", Toast.LENGTH_SHORT).show()
                                        dismiss()
                                        listener?.onSignInSuccess(userJson)
                                    }
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
                        Log.e("SignInModal", "Error parsing response", e)
                        showError("Error parsing response: ${e.message}")
                        resetButton()
                    }
                }
            }

            override fun onError(error: String) {
                Log.e("SignInModal", "SignIn error: $error")
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

    companion object {
        const val TAG = "SignInModal"
    }
}