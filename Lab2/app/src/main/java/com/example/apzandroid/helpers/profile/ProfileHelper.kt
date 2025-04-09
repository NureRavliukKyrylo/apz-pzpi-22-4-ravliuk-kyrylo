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
                        onFailure("Не вдалося завантажити профіль")
                    }
                } else {
                    onFailure("Помилка: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                onFailure("Не вдалося підключитися: ${t.localizedMessage}")
            }
        })
    }

    fun updateUserProfile(userId: String, name: String, email: String, csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        val updateRequest = UpdateCustomerRequest(name, email)

        RetrofitClient.accountService.updateUser(userId, updateRequest, csrfToken).enqueue(object : Callback<UpdateCustomerResponse> {
            override fun onResponse(call: Call<UpdateCustomerResponse>, response: Response<UpdateCustomerResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Помилка оновлення профілю")
                }
            }

            override fun onFailure(call: Call<UpdateCustomerResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.localizedMessage}")
            }
        })
    }

    fun changePassword(userId: String, oldPassword: String, newPassword: String, csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        val changePasswordRequest = ChangePasswordRequest(oldPassword, newPassword)

        RetrofitClient.accountService.changePassword(userId, changePasswordRequest, csrfToken).enqueue(object : Callback<ChangePasswordResponse> {
            override fun onResponse(call: Call<ChangePasswordResponse>, response: Response<ChangePasswordResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Помилка зміни пароля")
                }
            }

            override fun onFailure(call: Call<ChangePasswordResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.localizedMessage}")
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
                        onFailure("Не вдалося отримати налаштування")
                    }
                } else {
                    onFailure("Помилка: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<UserSettingsResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.localizedMessage}")
            }
        })
    }

    fun toggleEmailNotifications(csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.notificationService.toggleEmailNotifications(csrfToken).enqueue(object : Callback<ToggleEmailResponse> {
            override fun onResponse(call: Call<ToggleEmailResponse>, response: Response<ToggleEmailResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Помилка зміни налаштувань пошти")
                }
            }

            override fun onFailure(call: Call<ToggleEmailResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.localizedMessage}")
            }
        })
    }

    fun togglePushNotifications(csrfToken: String, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.notificationService.togglePushNotifications(csrfToken).enqueue(object : Callback<TogglePushResponse> {
            override fun onResponse(call: Call<TogglePushResponse>, response: Response<TogglePushResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Помилка зміни налаштувань пуш-повідомлень")
                }
            }

            override fun onFailure(call: Call<TogglePushResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.localizedMessage}")
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