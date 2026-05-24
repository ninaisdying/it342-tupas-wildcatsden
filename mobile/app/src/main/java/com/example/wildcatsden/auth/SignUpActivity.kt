package com.example.wildcatsden.auth

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.wildcatsden.R
import com.example.wildcatsden.core.network.ApiService
import org.json.JSONObject

class SignUpActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var spinnerUserType: Spinner
    private lateinit var layoutStudent: LinearLayout
    private lateinit var layoutCoordinator: LinearLayout
    private lateinit var layoutFaculty: LinearLayout
    private lateinit var etCourse: EditText
    private lateinit var etOrganization: EditText
    private lateinit var etAffiliation: EditText
    private lateinit var etDepartment: EditText
    private lateinit var btnCreateAccount: Button
    private lateinit var tvSignIn: TextView
    private lateinit var tvError: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        initViews()
        setupSpinner()
        setupClickListeners()
    }

    private fun initViews() {
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        spinnerUserType = findViewById(R.id.spinnerUserType)
        layoutStudent = findViewById(R.id.layoutStudent)
        layoutCoordinator = findViewById(R.id.layoutCoordinator)
        layoutFaculty = findViewById(R.id.layoutFaculty)
        etCourse = findViewById(R.id.etCourse)
        etOrganization = findViewById(R.id.etOrganization)
        etAffiliation = findViewById(R.id.etAffiliation)
        etDepartment = findViewById(R.id.etDepartment)
        btnCreateAccount = findViewById(R.id.btnCreateAccount)
        tvSignIn = findViewById(R.id.tvSignIn)
        tvError = findViewById(R.id.tvError)
    }

    private fun setupSpinner() {
        val userTypes = arrayOf("Select Role", "Student", "Coordinator", "Faculty")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, userTypes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerUserType.adapter = adapter

        spinnerUserType.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                when (position) {
                    1 -> { // Student
                        layoutStudent.visibility = View.VISIBLE
                        layoutCoordinator.visibility = View.GONE
                        layoutFaculty.visibility = View.GONE
                    }
                    2 -> { // Coordinator
                        layoutStudent.visibility = View.GONE
                        layoutCoordinator.visibility = View.VISIBLE
                        layoutFaculty.visibility = View.GONE
                    }
                    3 -> { // Faculty
                        layoutStudent.visibility = View.GONE
                        layoutCoordinator.visibility = View.GONE
                        layoutFaculty.visibility = View.VISIBLE
                    }
                    else -> { // Select Role
                        layoutStudent.visibility = View.GONE
                        layoutCoordinator.visibility = View.GONE
                        layoutFaculty.visibility = View.GONE
                    }
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupClickListeners() {
        btnCreateAccount.setOnClickListener {
            if (validateInput()) {
                performSignUp()
            }
        }

        tvSignIn.setOnClickListener {
            finish() // Go back to Sign In Activity
        }
    }

    private fun validateInput(): Boolean {
        tvError.visibility = View.GONE

        val firstName = etFirstName.text.toString().trim()
        val lastName = etLastName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()
        val userType = spinnerUserType.selectedItem.toString()

        when {
            firstName.isEmpty() -> {
                showError("First name is required")
                return false
            }
            lastName.isEmpty() -> {
                showError("Last name is required")
                return false
            }
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
            password.length < 8 -> {
                showError("Password must be at least 8 characters")
                return false
            }
            confirmPassword.isEmpty() -> {
                showError("Please confirm your password")
                return false
            }
            password != confirmPassword -> {
                showError("Passwords do not match")
                return false
            }
            userType == "Select Role" -> {
                showError("Please select a role")
                return false
            }
        }

        when (userType) {
            "Student" -> {
                if (etCourse.text.toString().trim().isEmpty()) {
                    showError("Course is required for students")
                    return false
                }
                if (etOrganization.text.toString().trim().isEmpty()) {
                    showError("Organization is required for students")
                    return false
                }
            }
            "Coordinator" -> {
                if (etAffiliation.text.toString().trim().isEmpty()) {
                    showError("Affiliation is required for coordinators")
                    return false
                }
            }
            "Faculty" -> {
                if (etDepartment.text.toString().trim().isEmpty()) {
                    showError("Department is required for faculty")
                    return false
                }
            }
        }

        return true
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun performSignUp() {
        btnCreateAccount.isEnabled = false
        btnCreateAccount.text = "Creating Account..."

        val selectedRole = spinnerUserType.selectedItem.toString()

        val userData = JSONObject().apply {
            put("firstName", etFirstName.text.toString().trim())
            put("lastName", etLastName.text.toString().trim())
            put("email", etEmail.text.toString().trim())
            put("password", etPassword.text.toString().trim())
            put("userType", selectedRole)

            when (selectedRole) {
                "Student" -> {
                    put("course", etCourse.text.toString().trim())
                    put("organization", etOrganization.text.toString().trim())
                }
                "Coordinator" -> {
                    put("affiliation", etAffiliation.text.toString().trim())
                }
                "Faculty" -> {
                    put("department", etDepartment.text.toString().trim())
                }
            }
        }

        ApiService.signUp(userData, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(this@SignUpActivity, "Account created successfully!", Toast.LENGTH_SHORT).show()
                    finish() // Return to Sign In
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
        btnCreateAccount.isEnabled = true
        btnCreateAccount.text = "Create Account"
    }
}