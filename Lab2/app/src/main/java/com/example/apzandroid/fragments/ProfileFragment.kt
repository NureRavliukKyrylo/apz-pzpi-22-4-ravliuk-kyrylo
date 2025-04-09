package com.example.apzandroid.fragments

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.widget.SwitchCompat
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.helpers.profile.ProfileHelper
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.utils.DateUtils

class ProfileFragment : Fragment() {

    private lateinit var usernameTextView: TextView
    private lateinit var emailTextView: TextView
    private lateinit var roleTextView: TextView
    private lateinit var dateJoinedTextView: TextView
    private lateinit var settingProfileButton: Button
    private lateinit var emailNotificationSwitch: SwitchCompat
    private lateinit var pushNotificationSwitch: SwitchCompat
    private var csrfToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.profile_view, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        usernameTextView = view.findViewById(R.id.usernameTextView)
        emailTextView = view.findViewById(R.id.emailTextView)
        roleTextView = view.findViewById(R.id.roleTextView)
        dateJoinedTextView = view.findViewById(R.id.dateJoinedTextView)

        emailNotificationSwitch = view.findViewById(R.id.emailNotificationSwitch)
        pushNotificationSwitch = view.findViewById(R.id.pushNotificationSwitch)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()

        settingProfileButton = view.findViewById(R.id.editProfileButton)

        settingProfileButton.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, SettingsProfileFragment())
                .addToBackStack(null)
                .commit()
        }

        getUserProfile()
        getUserNotificationSettings()

        emailNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
            toggleEmailNotifications()
        }

        pushNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
            togglePushNotifications()
        }
    }

    private fun getUserProfile() {
        ProfileHelper.getUserProfile(
            onSuccess = { userProfile ->
                val displayDate = DateUtils.parseDate(userProfile.date_joined)
                usernameTextView.text = "Username: ${userProfile.username}"
                emailTextView.text = "Email: ${userProfile.email}"
                dateJoinedTextView.text = "Date Joined: $displayDate"
                getRoleById(userProfile.role.toString())
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
            }
        )
    }

    private fun getRoleById(roleId: String) {
        ProfileHelper.getRoleById(
            roleId,
            onSuccess = { role ->
                roleTextView.text = "Role: ${role.name}"
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
            }
        )
    }

    private fun getUserNotificationSettings() {
        ProfileHelper.getUserNotificationSettings(
            csrfToken,
            onSuccess = { settings ->
                emailNotificationSwitch.isChecked = settings.email_notifications
                pushNotificationSwitch.isChecked = settings.push_notifications
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
            }
        )
    }

    private fun toggleEmailNotifications() {
        ProfileHelper.toggleEmailNotifications(
            csrfToken,
            onSuccess = {
                Toast.makeText(context, "Email notifications updated", Toast.LENGTH_SHORT).show()
            },
            onFailure = { errorMessage ->
                Log.e("NotificationSettings", errorMessage)
            }
        )
    }

    private fun togglePushNotifications() {
        ProfileHelper.togglePushNotifications(
            csrfToken,
            onSuccess = {
                Toast.makeText(context, "Push notifications updated", Toast.LENGTH_SHORT).show()
            },
            onFailure = { errorMessage ->
                Log.e("NotificationSettings", errorMessage)
            }
        )
    }

    private fun handleError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        Log.e("ProfileFragment", message)
    }
}
