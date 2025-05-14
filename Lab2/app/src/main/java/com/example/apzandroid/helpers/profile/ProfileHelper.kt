package com.example.apzandroid.helpers.profile

import com.example.apzandroid.models.account_models.ChangePasswordRequest
import com.example.apzandroid.models.account_models.ChangePasswordResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.models.account_models.UpdateCustomerRequest
import com.example.apzandroid.models.account_models.UpdateCustomerResponse
import com.example.apzandroid.models.notification_models.ToggleEmailResponse
import com.example.apzandroid.models.notification_models.TogglePushResponse
import com.example.apzandroid.models.notification_models.UserSettingsResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object ProfileHelper {

    fun getUserProfile(onSuccess: (MySelfResponse) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val userProfile = response.body()
                    if (userProfile != null) {
                        onSuccess(userProfile)
                    } else {
                        onFailure("Failed to load profile")
                    }
                } else {
                    onFailure("Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")
            }
        })
    }

    fun updateUserProfile(userId: Int, name: String, email: String, csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        val updateRequest = UpdateCustomerRequest(name, email)

        RetrofitClient.accountService.updateUser(userId, updateRequest, csrfToken).enqueue(object : Callback<UpdateCustomerResponse> {
            override fun onResponse(call: Call<UpdateCustomerResponse>, response: Response<UpdateCustomerResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Failed to get profile")
                }
            }

            override fun onFailure(call: Call<UpdateCustomerResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")

            }
        })
    }

    fun changePassword(userId: Int, oldPassword: String, newPassword: String, csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        val changePasswordRequest = ChangePasswordRequest(oldPassword, newPassword)

        RetrofitClient.accountService.changePassword(userId, changePasswordRequest, csrfToken).enqueue(object : Callback<ChangePasswordResponse> {
            override fun onResponse(call: Call<ChangePasswordResponse>, response: Response<ChangePasswordResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Failed to change password")
                }
            }

            override fun onFailure(call: Call<ChangePasswordResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")
            }
        })
    }

    fun getUserNotificationSettings(csrfToken: String, onSuccess: (UserSettingsResponse) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.notificationService.notificationOptions(csrfToken).enqueue(object : Callback<UserSettingsResponse> {
            override fun onResponse(call: Call<UserSettingsResponse>, response: Response<UserSettingsResponse>) {
                if (response.isSuccessful) {
                    val settings = response.body()
                    if (settings != null) {
                        onSuccess(settings)
                    } else {
                        onFailure("Failed to get settings")
                    }
                } else {
                    onFailure("Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<UserSettingsResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")
            }
        })
    }

    fun toggleEmailNotifications(csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.notificationService.toggleEmailNotifications(csrfToken).enqueue(object : Callback<ToggleEmailResponse> {
            override fun onResponse(call: Call<ToggleEmailResponse>, response: Response<ToggleEmailResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Failed to update email")
                }
            }

            override fun onFailure(call: Call<ToggleEmailResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")
            }
        })
    }

    fun togglePushNotifications(csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.notificationService.togglePushNotifications(csrfToken).enqueue(object : Callback<TogglePushResponse> {
            override fun onResponse(call: Call<TogglePushResponse>, response: Response<TogglePushResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Failed to update")
                }
            }

            override fun onFailure(call: Call<TogglePushResponse>, t: Throwable) {
                onFailure("Error: ${t.localizedMessage}")
            }
        })
    }

    fun getRoleById(roleId: String, onSuccess: (RoleResponse) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.accountService.roleUser(roleId).enqueue(object : Callback<RoleResponse> {
            override fun onResponse(call: Call<RoleResponse>, response: Response<RoleResponse>) {
                if (response.isSuccessful) {
                    val role = response.body()
                    if (role != null) {
                        onSuccess(role)
                    } else {
                        onFailure("Empty response body")
                    }
                } else {
                    onFailure("Error fetching role: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<RoleResponse>, t: Throwable) {
                onFailure("Failed to load role: ${t.localizedMessage}")
            }
        })
    }
}