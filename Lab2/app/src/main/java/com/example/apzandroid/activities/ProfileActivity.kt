package com.example.apzandroid.activities

import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.apzandroid.R
import com.example.apzandroid.models.account_models.MySelfResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileActivity : AppCompatActivity() {

    private lateinit var usernameTextView: TextView
    private lateinit var emailTextView: TextView
    private lateinit var roleTextView: TextView
    private lateinit var dateJoinedTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.profile_view)

        // Ініціалізація UI елементів
        usernameTextView = findViewById(R.id.usernameTextView)
        emailTextView = findViewById(R.id.emailTextView)
        roleTextView = findViewById(R.id.roleTextView)
        dateJoinedTextView = findViewById(R.id.dateJoinedTextView)

        // Отримуємо дані користувача
        getUserProfile()
    }

    private fun getUserProfile() {
        // Виклик API для отримання даних користувача
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val userProfile = response.body()

                    if (userProfile != null) {
                        // Відображаємо дані користувача
                        usernameTextView.text = "Username: ${userProfile.username}"
                        emailTextView.text = "Email: ${userProfile.email}"
                        roleTextView.text = "Role: ${userProfile.role}"
                        dateJoinedTextView.text = "Date Joined: ${userProfile.date_joined}"
                        println("User Profile Loaded: ${userProfile.username}")
                    }
                } else {
                    // Обробка ситуації, коли сервер повернув неуспішний статус
                    handleError("Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                // Обробка помилки під час виконання запиту
                handleError("Failed to load user profile: ${t.localizedMessage}")
            }
        })
    }

    // Метод для обробки помилок
    private fun handleError(message: String) {
        // Можна використовувати Toast для показу повідомлень
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        // Логування помилок (наприклад, у Logcat)
        println(message)
    }
}
