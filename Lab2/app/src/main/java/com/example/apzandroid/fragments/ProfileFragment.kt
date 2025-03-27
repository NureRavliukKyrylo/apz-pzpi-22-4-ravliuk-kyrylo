package com.example.apzandroid.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.utils.DateUtils
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileFragment : Fragment() {

    private lateinit var usernameTextView: TextView
    private lateinit var emailTextView: TextView
    private lateinit var roleTextView: TextView
    private lateinit var dateJoinedTextView: TextView
    private lateinit var  settingProfileButton: Button

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

        settingProfileButton = view.findViewById(R.id.editProfileButton)

        settingProfileButton.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, SettingsProfileFragment())
                .addToBackStack(null)
                .commit()
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
}
