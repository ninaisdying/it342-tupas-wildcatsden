package com.example.wildcatsden.auth.components

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.example.wildcatsden.R
import com.example.wildcatsden.core.network.ApiService
import org.json.JSONObject

class SignUpModal : DialogFragment() {

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
    private lateinit var btnClose: TextView

    private var listener: SignUpListener? = null

    interface SignUpListener {
        fun onSignUpSuccess()
        fun onSignInClick()
        fun onModalDismiss()
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        listener = parentFragment as? SignUpListener ?: context as? SignUpListener
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val builder = AlertDialog.Builder(requireActivity())
        val inflater = requireActivity().layoutInflater
        val view = inflater.inflate(R.layout.modal_signup, null)

        initViews(view)
        setupSpinner()
        setupClickListeners()

        builder.setView(view)
        return builder.create()
    }

    private fun initViews(view: View) {
        etFirstName = view.findViewById(R.id.etFirstName)
        etLastName = view.findViewById(R.id.etLastName)
        etEmail = view.findViewById(R.id.etEmail)
        etPassword = view.findViewById(R.id.etPassword)
        etConfirmPassword = view.findViewById(R.id.etConfirmPassword)
        spinnerUserType = view.findViewById(R.id.spinnerUserType)
        layoutStudent = view.findViewById(R.id.layoutStudent)
        layoutCoordinator = view.findViewById(R.id.layoutCoordinator)
        layoutFaculty = view.findViewById(R.id.layoutFaculty)
        etCourse = view.findViewById(R.id.etCourse)
        etOrganization = view.findViewById(R.id.etOrganization)
        etAffiliation = view.findViewById(R.id.etAffiliation)
        etDepartment = view.findViewById(R.id.etDepartment)
        btnCreateAccount = view.findViewById(R.id.btnCreateAccount)
        tvSignIn = view.findViewById(R.id.tvSignIn)
        tvError = view.findViewById(R.id.tvError)
        btnClose = view.findViewById(R.id.btnClose)
    }

    private fun setupSpinner() {
        val userTypes = arrayOf("Select Role", "Student", "Coordinator", "Faculty")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, userTypes)
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
            dismiss()
            listener?.onSignInClick()
        }

        btnClose.setOnClickListener {
            dismiss()
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

        // Validate role-specific fields
        when (userType) {
            "Student" -> {
                val course = etCourse.text.toString().trim()
                val org = etOrganization.text.toString().trim()
                if (course.isEmpty()) {
                    showError("Course is required for students")
                    return false
                }
                if (org.isEmpty()) {
                    showError("Organization is required for students")
                    return false
                }
            }
            "Coordinator" -> {
                val affiliation = etAffiliation.text.toString().trim()
                if (affiliation.isEmpty()) {
                    showError("Affiliation is required for coordinators")
                    return false
                }
            }
            "Faculty" -> {
                val department = etDepartment.text.toString().trim()
                if (department.isEmpty()) {
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

        // Match exactly what your backend expects
        val userData = JSONObject().apply {
            put("firstName", etFirstName.text.toString().trim())
            put("lastName", etLastName.text.toString().trim())
            put("email", etEmail.text.toString().trim())
            put("password", etPassword.text.toString().trim())
            put("userType", selectedRole)  // Send exactly as selected

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
                "Custodian" -> {
                    put("department", etDepartment.text.toString().trim())
                }
            }
        }

        Log.d("SignUpModal", "Sending signup data: $userData")

        ApiService.signUp(userData, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                Log.d("SignUpModal", "SignUp success: $response")
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(context, "Account created successfully!", Toast.LENGTH_SHORT).show()
                    dismiss()
                    listener?.onSignUpSuccess()
                }
            }

            override fun onError(error: String) {
                Log.e("SignUpModal", "SignUp error: $error")
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
//    TO LOG WHO IS DOING WHAT
    companion object {
        const val TAG = "SignUpModal"
    }
}