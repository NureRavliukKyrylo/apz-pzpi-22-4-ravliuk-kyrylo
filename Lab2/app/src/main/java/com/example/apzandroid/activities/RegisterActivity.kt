package com.example.apzandroid.activities

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.view.MotionEvent
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.apzandroid.R
import com.example.apzandroid.helpers.auth.AuthHelper

class RegisterActivity : AppCompatActivity() {

    private var isPasswordVisible = false

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val usernameEditText = findViewById<EditText>(R.id.registerUsername)
        val emailEditText = findViewById<EditText>(R.id.registerEmail)
        val passwordEditText = findViewById<EditText>(R.id.registerPassword)
        val registerButton = findViewById<Button>(R.id.registerButton)
        val loginLinkText = findViewById<TextView>(R.id.loginLinkText)

        emailEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val icon = ContextCompat.getDrawable(this@RegisterActivity, R.drawable.done_icon)
                val colorRes = if (s.isNullOrBlank()) R.color.gray else R.color.green
                icon?.setTint(ContextCompat.getColor(this@RegisterActivity, colorRes))
                emailEditText.setCompoundDrawablesWithIntrinsicBounds(null, null, icon, null)
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        usernameEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val icon = ContextCompat.getDrawable(this@RegisterActivity, R.drawable.done_icon)
                val colorRes = if (s.isNullOrBlank()) R.color.gray else R.color.green
                icon?.setTint(ContextCompat.getColor(this@RegisterActivity, colorRes))
                usernameEditText.setCompoundDrawablesWithIntrinsicBounds(null, null, icon, null)
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        passwordEditText.setOnTouchListener { v, event ->
            if (event.action == MotionEvent.ACTION_UP) {
                val drawableEnd = 2
                val drawable = passwordEditText.compoundDrawables[drawableEnd]
                if (drawable != null) {
                    val bounds = drawable.bounds
                    val touchX = event.rawX.toInt()
                    val iconStart = passwordEditText.right - bounds.width() - passwordEditText.paddingEnd

                    if (touchX >= iconStart) {
                        isPasswordVisible = !isPasswordVisible
                        val inputType = if (isPasswordVisible)
                            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                        else
                            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD

                        passwordEditText.inputType = inputType
                        passwordEditText.setSelection(passwordEditText.text.length)
                        return@setOnTouchListener true
                    }
                }
            }
            false
        }

        registerButton.setOnClickListener {
            val username = usernameEditText.text.toString()
            val email = emailEditText.text.toString()
            val password = passwordEditText.text.toString()

            if (username.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()) {
                AuthHelper.registerUser(this, username, email, password)
            } else {
                Toast.makeText(this, "Fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        loginLinkText.setOnClickListener {
            startActivity(Intent(this@RegisterActivity, LoginActivity::class.java))
        }
    }
}
