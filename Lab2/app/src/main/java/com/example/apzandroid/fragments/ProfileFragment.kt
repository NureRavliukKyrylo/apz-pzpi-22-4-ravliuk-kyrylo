package com.example.apzandroid.fragments

import android.content.Context
import android.content.Context.MODE_PRIVATE
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
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.models.notification_models.ToggleEmailResponse
import com.example.apzandroid.models.notification_models.TogglePushResponse
import com.example.apzandroid.models.notification_models.UserSettingsResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.utils.DateUtils
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

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

        val prefs = context?.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val role = prefs?.getString("user_role", "не збережено")

        Log.d("ROLE_CHECK", "Роль користувача: $role")


        settingProfileButton.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, SettingsProfileFragment())
                .addToBackStack(null)
                .commit()
        }

        getUserNotificationSettings()

        emailNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
            toggleEmailNotifications()
        }

        pushNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
            togglePushNotifications()
        }

        getUserProfile()
    }

    private fun getUserProfile() {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val userProfile = response.body()

                    if (userProfile != null) {
                        val displayDate = DateUtils.parseDate(userProfile.date_joined)

                        usernameTextView.text = "Username: ${userProfile.username}"
                        emailTextView.text = "Email: ${userProfile.email}"
                        dateJoinedTextView.text = "Date Joined: $displayDate"

                        getRoleById(userProfile.role.toString())
                    }
                } else {
                    handleError("Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                handleError("Failed to load user profile: ${t.localizedMessage}")
            }
        })
    }

    private fun getRoleById(roleId: String) {
        RetrofitClient.accountService.roleUser(roleId).enqueue(object : Callback<RoleResponse> {
            override fun onResponse(call: Call<RoleResponse>, response: Response<RoleResponse>) {
                if (response.isSuccessful) {
                    val role = response.body()

                    if (role != null) {
                        roleTextView.text = "Role: ${role.name}"
                    }
                } else {
                    handleError("Error fetching role: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<RoleResponse>, t: Throwable) {
                handleError("Failed to load role: ${t.localizedMessage}")
            }
        })
    }

    private fun handleError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        println(message)
    }

    private fun getUserNotificationSettings() {
        RetrofitClient.notificationService.notificationOptions(csrfToken)
            .enqueue(object : Callback<UserSettingsResponse> {
                override fun onResponse(
                    call: Call<UserSettingsResponse>,
                    response: Response<UserSettingsResponse>
                ) {
                    if (response.isSuccessful) {
                        val settings = response.body()
                        if (settings != null) {
                            emailNotificationSwitch.setOnCheckedChangeListener(null)
                            pushNotificationSwitch.setOnCheckedChangeListener(null)

                            emailNotificationSwitch.isChecked = settings.email_notifications
                            pushNotificationSwitch.isChecked = settings.push_notifications

                            emailNotificationSwitch.setOnCheckedChangeListener { _, _ ->
                                toggleEmailNotifications()
                            }

                            pushNotificationSwitch.setOnCheckedChangeListener { _, _ ->
                                togglePushNotifications()
                            }
                        }
                    } else {
                        Log.e(
                            "NotificationSettings",
                            "Failed to load notification settings: ${response.code()} - ${
                                response.errorBody()?.string()
                            }"
                        )
                    }
                }

                override fun onFailure(call: Call<UserSettingsResponse>, t: Throwable) {
                    handleError("Error: ${t.localizedMessage}")
                }
            })
    }


    private fun toggleEmailNotifications(){
        RetrofitClient.notificationService.toggleEmailNotifications(csrfToken)
            .enqueue(object : Callback<ToggleEmailResponse> {
                override fun onResponse(call: Call<ToggleEmailResponse>, response: Response<ToggleEmailResponse>) {
                    if (response.isSuccessful) {
                        val newState = response.body()?.email_notifications ?: false
                        emailNotificationSwitch.isChecked = newState
                        Toast.makeText(context, "Email notifications updated", Toast.LENGTH_SHORT).show()
                    } else {
                        Log.e("NotificationSettings", "Failed to toggle email: ${response.code()}")
                    }
                }

                override fun onFailure(call: Call<ToggleEmailResponse>, t: Throwable) {
                    Log.e("NotificationSettings", "Error: ${t.localizedMessage}")
                }
            })
    }

    private fun togglePushNotifications() {
        RetrofitClient.notificationService.togglePushNotifications(csrfToken)
            .enqueue(object : Callback<TogglePushResponse> {
                override fun onResponse(call: Call<TogglePushResponse>, response: Response<TogglePushResponse>) {
                    if (response.isSuccessful) {
                        val newState = response.body()?.push_notifications ?: false
                        pushNotificationSwitch.isChecked = newState
                        Toast.makeText(context, "Push notifications updated", Toast.LENGTH_SHORT).show()
                    } else {
                        Log.e("NotificationSettings", "Failed to toggle push: ${response.code()}")
                    }
                }

                override fun onFailure(call: Call<TogglePushResponse>, t: Throwable) {
                    Log.e("NotificationSettings", "Error: ${t.localizedMessage}")
                }
            })
    }
}
