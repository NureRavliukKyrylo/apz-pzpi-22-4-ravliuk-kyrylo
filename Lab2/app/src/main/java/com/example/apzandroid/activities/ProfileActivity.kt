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
        
        usernameTextView = findViewById(R.id.usernameTextView)
        emailTextView = findViewById(R.id.emailTextView)
        roleTextView = findViewById(R.id.roleTextView)
        dateJoinedTextView = findViewById(R.id.dateJoinedTextView)

        getUserProfile()
    }

    private fun getUserProfile() {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val userProfile = response.body()

                    if (userProfile != null) {
                        usernameTextView.text = "Username: ${userProfile.username}"
                        emailTextView.text = "Email: ${userProfile.email}"
                        roleTextView.text = "Role: ${userProfile.role}"
                        dateJoinedTextView.text = "Date Joined: ${userProfile.date_joined}"
                        println("User Profile Loaded: ${userProfile.username}")
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

    private fun handleError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        println(message)
    }
}
