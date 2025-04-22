package com.example.apzandroid.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
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
    private lateinit var progressBar: ProgressBar
    private lateinit var profileContainer: View
    private var csrfToken: String = ""
    private var profileLoaded = false
    private var notificationsLoaded = false
    private var loadStartTime: Long = 0

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.profile_view, container, false)

        progressBar = view.findViewById(R.id.progressBaProfile)
        profileContainer = view.findViewById(R.id.profileContainerFragmentSub)

        progressBar.visibility = View.VISIBLE
        profileContainer.visibility = View.GONE

        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        loadStartTime = System.currentTimeMillis()

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

        Handler(Looper.getMainLooper()).postDelayed({
            if (progressBar.visibility == View.VISIBLE) {
                progressBar.visibility = View.GONE
                profileContainer.visibility = View.VISIBLE
            }
        }, 500)

    }

    private fun getUserProfile() {
        ProfileHelper.getUserProfile(
            onSuccess = { userProfile ->
                val displayDate = DateUtils.parseDate(userProfile.date_joined)
                usernameTextView.text = "Username: ${userProfile.username}"
                emailTextView.text = "Email: ${userProfile.email}"
                dateJoinedTextView.text = "Date Joined: $displayDate"
                getRoleById(userProfile.role.toString())
                profileLoaded = true
                checkAllDataLoaded()
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
                profileLoaded = true
                checkAllDataLoaded()
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
                roleTextView.text = "Role: Unknown"
            }
        )
    }

    private fun getUserNotificationSettings() {
        ProfileHelper.getUserNotificationSettings(
            csrfToken,
            onSuccess = { settings ->
                emailNotificationSwitch.setOnCheckedChangeListener(null)
                pushNotificationSwitch.setOnCheckedChangeListener(null)

                emailNotificationSwitch.isChecked = settings.email_notifications
                pushNotificationSwitch.isChecked = settings.push_notifications

                emailNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
                    toggleEmailNotifications()
                }

                pushNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
                    togglePushNotifications()
                }

                notificationsLoaded = true
                checkAllDataLoaded()
            },
            onFailure = { errorMessage ->
                handleError(errorMessage)
                notificationsLoaded = true
                checkAllDataLoaded()
            }
        )
    }

    private fun checkAllDataLoaded() {
        if (profileLoaded && notificationsLoaded) {
            val elapsed = System.currentTimeMillis() - loadStartTime
            val remaining = maxOf(1000 - elapsed, 0)

            Handler(Looper.getMainLooper()).postDelayed({
                progressBar.visibility = View.GONE
                profileContainer.visibility = View.VISIBLE
            }, remaining)
        }
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
                Log.e("NotificationSettings", "Error: $errorMessage")

                if (errorMessage != null) {
                    Log.e("NotificationSettings", "Server response: $errorMessage")
                }
                Log.e("NotificationSettings", errorMessage)
            }
        )
    }

    private fun handleError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        Log.e("ProfileFragment", message)
    }
}