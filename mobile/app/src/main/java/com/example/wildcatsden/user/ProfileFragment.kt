package com.example.wildcatsden.user

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.bumptech.glide.Glide
import com.example.wildcatsden.R
import com.example.wildcatsden.auth.SignInActivity
import com.example.wildcatsden.core.network.ApiService
import com.example.wildcatsden.core.network.session.UserSession
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputEditText
import org.json.JSONObject

class ProfileFragment : Fragment() {

    private lateinit var ivProfilePhoto: ImageView
    private lateinit var fabEditPhoto: FloatingActionButton
    private lateinit var tvName: TextView
    private lateinit var tvEmail: TextView
    private lateinit var tvUserType: TextView
    private lateinit var tvAbout: TextView
    private lateinit var tvLocation: TextView
    private lateinit var tvStatus: TextView
    private lateinit var btnEditProfile: Button
    private lateinit var btnLogout: Button

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri: Uri? = result.data?.data
            imageUri?.let { uploadPhoto(it) }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_profile, container, false)
        initViews(view)
        loadUserData()
        setupListeners()
        return view
    }

    private fun initViews(view: View) {
        ivProfilePhoto = view.findViewById(R.id.ivProfilePhoto)
        fabEditPhoto = view.findViewById(R.id.fabEditPhoto)
        tvName = view.findViewById(R.id.tvProfileName)
        tvEmail = view.findViewById(R.id.tvProfileEmail)
        tvUserType = view.findViewById(R.id.tvUserType)
        tvAbout = view.findViewById(R.id.tvAbout)
        tvLocation = view.findViewById(R.id.tvLocation)
        tvStatus = view.findViewById(R.id.tvStatus)
        btnEditProfile = view.findViewById(R.id.btnEditProfile)
        btnLogout = view.findViewById(R.id.btnLogout)
    }

    private fun loadUserData() {
        val user = UserSession.getUser() ?: return

        tvName.text = "${user.optString("firstName")} ${user.optString("lastName")}"
        tvEmail.text = user.optString("email")
        tvUserType.text = user.optString("userType").uppercase()
        tvAbout.text = user.optString("about").takeIf { it.isNotEmpty() && it != "null" } ?: "No information provided"
        tvLocation.text = user.optString("location").takeIf { it.isNotEmpty() && it != "null" } ?: "No location provided"

        val firstLogin = user.optBoolean("firstLogin", false)
        tvStatus.text = if (firstLogin) "First Login - Please change password" else "Active"
        tvStatus.setTextColor(if (firstLogin) 0xFFFFC107.toInt() else 0xFF28A745.toInt())

        val photoUrl = user.optString("profilePhoto")
        if (photoUrl.isNotEmpty() && photoUrl != "null") {
            val resolvedUrl = if (photoUrl.startsWith("http")) photoUrl else "http://10.0.2.2:8080$photoUrl"
            Glide.with(this)
                .load(resolvedUrl)
                .placeholder(R.drawable.ic_default_profile)
                .error(R.drawable.ic_default_profile)
                .circleCrop()
                .into(ivProfilePhoto)
        }
    }

    private fun setupListeners() {
        fabEditPhoto.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            pickImageLauncher.launch(intent)
        }

        btnEditProfile.setOnClickListener {
            showEditProfileDialog()
        }

        btnLogout.setOnClickListener {
            UserSession.logout()
            val intent = Intent(requireContext(), SignInActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }
    }

    private fun showEditProfileDialog() {
        val user = UserSession.getUser() ?: return
        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_profile, null)

        val etFirstName = dialogView.findViewById<TextInputEditText>(R.id.etFirstName)
        val etLastName = dialogView.findViewById<TextInputEditText>(R.id.etLastName)
        val etAbout = dialogView.findViewById<TextInputEditText>(R.id.etAbout)
        val etLocation = dialogView.findViewById<TextInputEditText>(R.id.etLocation)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnCancel)
        val btnSave = dialogView.findViewById<Button>(R.id.btnSave)

        etFirstName.setText(user.optString("firstName"))
        etLastName.setText(user.optString("lastName"))
        etAbout.setText(user.optString("about").takeIf { it != "null" } ?: "")
        etLocation.setText(user.optString("location").takeIf { it != "null" } ?: "")

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnSave.setOnClickListener {
            val updatedData = JSONObject().apply {
                put("firstName", etFirstName.text.toString())
                put("lastName", etLastName.text.toString())
                put("about", etAbout.text.toString())
                put("location", etLocation.text.toString())
                put("email", user.optString("email")) // Keep existing email
                put("userType", user.optString("userType")) // Keep existing type
            }
            performUpdateProfile(updatedData, dialog)
        }

        dialog.show()
    }

    private fun performUpdateProfile(data: JSONObject, dialog: AlertDialog) {
        val userId = UserSession.getUserId()
        ApiService.updateUser(userId, data, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                activity?.runOnUiThread {
                    Toast.makeText(requireContext(), "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                    if (response is JSONObject) {
                        UserSession.saveUser(response)
                        loadUserData()
                    } else {
                        // Fallback: fetch user again or just reload from local data if response is string
                        fetchUpdatedUser(userId)
                    }
                    dialog.dismiss()
                }
            }

            override fun onError(error: String) {
                activity?.runOnUiThread {
                    Toast.makeText(requireContext(), "Update failed: $error", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }

    private fun fetchUpdatedUser(userId: Int) {
        ApiService.getUserById(userId, object : ApiService.ApiCallback {
            override fun onSuccess(response: Any?) {
                if (response is JSONObject) {
                    activity?.runOnUiThread {
                        UserSession.saveUser(response)
                        loadUserData()
                    }
                }
            }
            override fun onError(error: String) {}
        })
    }

    private fun uploadPhoto(uri: Uri) {
        try {
            val inputStream = requireContext().contentResolver.openInputStream(uri)
            val bytes = inputStream?.readBytes() ?: return
            val fileName = "profile_${UserSession.getUserId()}.jpg"

            Toast.makeText(requireContext(), "Uploading photo...", Toast.LENGTH_SHORT).show()

            ApiService.updateProfilePhoto(UserSession.getUserId(), bytes, fileName, object : ApiService.ApiCallback {
                override fun onSuccess(response: Any?) {
                    activity?.runOnUiThread {
                        Toast.makeText(requireContext(), "Photo updated successfully!", Toast.LENGTH_SHORT).show()
                        fetchUpdatedUser(UserSession.getUserId())
                    }
                }

                override fun onError(error: String) {
                    activity?.runOnUiThread {
                        Toast.makeText(requireContext(), "Upload failed: $error", Toast.LENGTH_SHORT).show()
                    }
                }
            })
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(requireContext(), "Failed to read image", Toast.LENGTH_SHORT).show()
        }
    }
}