package com.example.apzandroid.helpers.auth

import android.content.Context
import android.content.Intent
import android.widget.Toast
import com.example.apzandroid.models.auth_models.LoginRequest
import com.example.apzandroid.models.auth_models.LoginResponse
import com.example.apzandroid.models.auth_models.RegisterRequest
import com.example.apzandroid.models.auth_models.RegisterResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.activities.MainMenu
import com.example.apzandroid.api.AccountService.DeviceTokenRequest
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object AuthHelper {

    fun registerUser(context: Context, username: String, email: String, password: String) {
        val request = RegisterRequest(username, email, password)

        RetrofitClient.authService.register(request).enqueue(object : Callback<RegisterResponse> {
            override fun onResponse(call: Call<RegisterResponse>, response: Response<RegisterResponse>) {
                if (response.isSuccessful) {
                    val cookies = response.headers().values("Set-Cookie")
                    var csrfToken: String? = null

                    if (cookies.isNotEmpty()) {
                        for (cookie in cookies) {
                            if (cookie.contains("csrftoken")) {
                                csrfToken = cookie.split(";")[0].split("=")[1]
                                CsrfTokenManager.saveCsrfToken(context, csrfToken)
                            }
                        }
                    }

                    Toast.makeText(context, "Registration successful!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(context, MainMenu::class.java)
                    context.startActivity(intent)
                    fetchUserRoleAndNavigate(context)
                } else {
                    Toast.makeText(context, "Registration failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun loginUser(context: Context, username: String, password: String, firebaseToken: String?) {
        val request = LoginRequest(username, password)
        RetrofitClient.authService.login(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val cookies = response.headers().values("Set-Cookie")
                    var csrfToken: String? = null

                    if (cookies.isNotEmpty()) {
                        for (cookie in cookies) {
                            if (cookie.contains("csrftoken")) {
                                csrfToken = cookie.split(";")[0].split("=")[1]
                                CsrfTokenManager.saveCsrfToken(context, csrfToken)
                            }
                        }
                        Toast.makeText(context, "Login successful!", Toast.LENGTH_SHORT).show()
                    }

                    firebaseToken?.let {
                        sendFirebaseToken(context, it)
                    }

                    fetchUserRoleAndNavigate(context)

                } else {
                    Toast.makeText(context, "Invalid credentials", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun fetchUserRoleAndNavigate(context: Context) {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val mySelf = response.body()
                    val roleId = mySelf?.role ?: return
                    RetrofitClient.accountService.roleUser(roleId.toString())
                        .enqueue(object : Callback<RoleResponse> {
                            override fun onResponse(call: Call<RoleResponse>, response: Response<RoleResponse>) {
                                if (response.isSuccessful) {
                                    val roleName = response.body()?.name ?: "user"
                                    val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                                    prefs.edit().putString("user_role", roleName).apply()

                                    val intent = Intent(context, MainMenu::class.java)
                                    context.startActivity(intent)
                                } else {
                                    Toast.makeText(context, "Error fetching user role", Toast.LENGTH_SHORT).show()
                                }
                            }

                            override fun onFailure(call: Call<RoleResponse>, t: Throwable) {
                                Toast.makeText(context, "Role fetching error: ${t.message}", Toast.LENGTH_SHORT).show()
                            }
                        })
                } else {
                    Toast.makeText(context, "Unable to get user profile", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                Toast.makeText(context, "Profile fetching error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun sendFirebaseToken(context: Context, token: String) {
        val csrfToken = CsrfTokenManager.getCsrfToken(context)
        val request = DeviceTokenRequest(token)

        RetrofitClient.accountService.registerDeviceToken(request, csrfToken ?: "").enqueue(
            object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    if (response.isSuccessful) {
                        Toast.makeText(context, "Device token registered", Toast.LENGTH_SHORT).show()
                    } else {
                        val errorBody = response.errorBody()?.string() ?: "No error body"
                        Toast.makeText(
                            context,
                            "Failed to register token: $errorBody",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}
