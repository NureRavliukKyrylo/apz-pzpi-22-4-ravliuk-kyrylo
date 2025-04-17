package com.example.apzandroid.fragments

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import android.widget.Button
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.models.account_models.ChangePasswordRequest
import com.example.apzandroid.models.account_models.ChangePasswordResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.UpdateCustomerRequest
import com.example.apzandroid.models.account_models.UpdateCustomerResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.helpers.profile.ProfileHelper
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SettingsProfileFragment : Fragment() {

    private lateinit var usernameEditText: EditText
    private lateinit var emailEditText: EditText
    private lateinit var updateButton: Button
    private lateinit var oldPasswordEditText: EditText
    private lateinit var newPasswordEditText: EditText
    private lateinit var changePasswordButton: Button

    private var userId: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.settings_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        usernameEditText = view.findViewById(R.id.editUsernameSettings)
        emailEditText = view.findViewById(R.id.editEmailSettings)
        updateButton = view.findViewById(R.id.saveUserInfoButtonSettings)
        oldPasswordEditText = view.findViewById(R.id.oldPasswordEditTextSettings)
        newPasswordEditText = view.findViewById(R.id.newPasswordEditTextSettings)
        changePasswordButton = view.findViewById(R.id.changePasswordButton)

        getUserProfile()

        updateButton.setOnClickListener {
            updateUser()
        }

        changePasswordButton.setOnClickListener {
            changePassword()
        }
    }

    private fun getUserProfile() {
        ProfileHelper.getUserProfile(
            onSuccess = { userProfile ->
                usernameEditText.setText(userProfile.username.toString())
                emailEditText.setText(userProfile.email.toString())
                userId = userProfile.id
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
            }
        )
    }

    private fun updateUser() {
        val name = usernameEditText.text.toString()
        val email = emailEditText.text.toString()

        if (name.isEmpty() || email.isEmpty()) {
            Toast.makeText(requireContext(), "Fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())
        if (csrfToken == null) {
            Toast.makeText(requireContext(), "CSRF token is not found", Toast.LENGTH_SHORT).show()
            return
        }

        ProfileHelper.updateUserProfile(
            userId, name, email, csrfToken,
            onSuccess = {
                Toast.makeText(requireContext(), "Data updated", Toast.LENGTH_SHORT).show()
                activity?.supportFragmentManager?.popBackStack()
            },
            onFailure = { errorMessage ->
                Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_SHORT).show()
            }
        )
    }

    private fun changePassword() {
        val oldPassword = oldPasswordEditText.text.toString()
        val newPassword = newPasswordEditText.text.toString()

        if (oldPassword.isEmpty() || newPassword.isEmpty()) {
            Toast.makeText(requireContext(), "Fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())
        if (csrfToken == null) {
            Toast.makeText(requireContext(), "CSRF token not found", Toast.LENGTH_SHORT).show()
            return
        }

        ProfileHelper.changePassword(
            userId, oldPassword, newPassword, csrfToken,
            onSuccess = {
                Toast.makeText(requireContext(), "Password has successfully updated", Toast.LENGTH_SHORT).show()
                activity?.supportFragmentManager?.popBackStack()
            },
            onFailure = { errorMessage ->
                Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_SHORT).show()
            }
        )
    }

    private fun handleError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        println(message)
    }
}
