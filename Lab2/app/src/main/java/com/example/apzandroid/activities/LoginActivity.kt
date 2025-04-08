package com.example.apzandroid.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.apzandroid.R
import com.example.apzandroid.models.auth_models.LoginRequest
import com.example.apzandroid.models.auth_models.LoginResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login_view)

        val emailEditText = findViewById<EditText>(R.id.emailLogin)
        val passwordEditText = findViewById<EditText>(R.id.passwordLogin)
        val loginButton = findViewById<Button>(R.id.loginButton)

        loginButton.setOnClickListener {
            val username = emailEditText.text.toString()
            val password = passwordEditText.text.toString()

            if (username.isNotEmpty() && password.isNotEmpty()) {
                loginUser(username, password)
            } else {
                Toast.makeText(this, "Please enter credentials", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loginUser(username: String, password: String) {
        val request = LoginRequest(username, password)
        Log.d("LOGIN_REQ", Gson().toJson(request))
        RetrofitClient.authService.login(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val cookies = response.headers().values("Set-Cookie")
                    var csrfToken: String? = null

                    if (cookies.isNotEmpty()) {
                        for (cookie in cookies) {
                            Log.d("Cookies", "Received cookie: $cookie")

                            if (cookie.contains("csrftoken")) {
                                csrfToken = cookie.split(";")[0].split("=")[1]
                                CsrfTokenManager.saveCsrfToken(applicationContext, csrfToken)
                            }
                        }
                        Toast.makeText(applicationContext, "Login successful!", Toast.LENGTH_SHORT).show()
                    }

                    fetchUserRoleAndNavigate()

                } else {
                    Toast.makeText(applicationContext, "Invalid credentials", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(applicationContext, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                Log.e("LoginError", "Error: ${t.message}")
            }
        })
    }

    private fun fetchUserRoleAndNavigate() {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val mySelf = response.body()
                    val roleId = mySelf?.role ?: return
                    Log.d("DEBUG_ROLE", "role = ${mySelf?.role}")
                    RetrofitClient.accountService.roleUser(roleId.toString())
                        .enqueue(object : Callback<RoleResponse> {
                            override fun onResponse(
                                call: Call<RoleResponse>,
                                response: Response<RoleResponse>
                            ) {
                                if (response.isSuccessful) {
                                    val roleName = response.body()?.name ?: "user"

                                    val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
                                    prefs.edit().putString("user_role", roleName).apply()

                                    Log.d("ROLE", "User role: $roleName")

                                    val intent = Intent(this@LoginActivity, MainMenu::class.java)
                                    startActivity(intent)
                                    finish()

                                } else {
                                    Toast.makeText(
                                        this@LoginActivity,
                                        "Помилка при отриманні ролі",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                            }

                            override fun onFailure(call: Call<RoleResponse>, t: Throwable) {
                                Toast.makeText(
                                    this@LoginActivity,
                                    "Помилка з роллю: ${t.message}",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        })

                } else {
                    Toast.makeText(
                        this@LoginActivity,
                        "Не вдалося отримати дані користувача",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                Toast.makeText(this@LoginActivity, "Помилка профілю: ${t.message}", Toast.LENGTH_SHORT).show()
                Log.e("LoginActivity", "Помилка профілю: ${t.message}")
            }
        })
    }
}
