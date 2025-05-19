package com.example.apzandroid.helpers.auth

import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import com.example.apzandroid.models.auth_models.LoginRequest
import com.example.apzandroid.models.auth_models.LoginResponse
import com.example.apzandroid.models.auth_models.RegisterRequest
import com.example.apzandroid.models.auth_models.RegisterResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.activities.MainMenu
import com.example.apzandroid.models.auth_models.DeviceTokenRequest
import com.example.apzandroid.models.auth_models.GoogleLoginRequest
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object AuthHelper {

    fun registerUser(context: Context, username: String, email: String, password: String, firebaseToken: String?) {
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

                    fetchUserRoleAndNavigate(context) {
                        sendFirebaseToken(context, firebaseToken.toString())
                    }

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

                    fetchUserRoleAndNavigate(context) {
                        sendFirebaseToken(context, firebaseToken.toString())
                    }

                } else {
                    Toast.makeText(context, "Invalid credentials", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun fetchUserRoleAndNavigate(context: Context, onSuccess: (() -> Unit)? = null) {
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

                                    onSuccess?.invoke()
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

    fun firebaseAuthWithGoogle(
        context: Context,
        googleSignInAccount: GoogleSignInAccount,
        firebaseToken: String?
    ) {
        val idToken = googleSignInAccount.idToken ?: return

        val credential = GoogleAuthProvider.getCredential(idToken, null)
        FirebaseAuth.getInstance().signInWithCredential(credential)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val user = FirebaseAuth.getInstance().currentUser
                    Toast.makeText(context, "Signed in as ${user?.email}", Toast.LENGTH_SHORT).show()

                    val googleLoginRequest = GoogleLoginRequest(google_token = idToken)

                    RetrofitClient.authService.loginGoogle(googleLoginRequest).enqueue(object : Callback<ResponseBody> {
                        override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
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
                                Log.d("LOGIN_GOOGLE", "Server response: ${response.code()} ${response.message()}")
                                val body = response.body()?.string()
                                Log.d("LOGIN_GOOGLE", "Response body: $body")

                                fetchUserRoleAndNavigate(context) {
                                    sendFirebaseToken(context, firebaseToken.toString())
                                }
                            } else {
                                val errorBody = response.errorBody()?.string()
                                Log.e("LOGIN_GOOGLE", "Error response: ${response.code()} ${response.message()}")
                                Log.e("LOGIN_GOOGLE", "Error body: $errorBody")

                                Toast.makeText(context, "Server login failed", Toast.LENGTH_SHORT).show()
                            }
                        }

                        override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                            Log.e("LOGIN_GOOGLE", "Network error: ${t.localizedMessage}", t)
                            Toast.makeText(context, "Network error: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                        }
                    })
                } else {
                    Toast.makeText(context, "Authentication Failed.", Toast.LENGTH_SHORT).show()
                }
            }
    }
}
