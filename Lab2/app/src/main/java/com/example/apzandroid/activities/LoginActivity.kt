package com.example.apzandroid.activities

import android.annotation.SuppressLint
import android.os.Bundle
import android.text.InputType
import android.text.TextWatcher
import android.text.Editable
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.apzandroid.R
import com.example.apzandroid.helpers.auth.AuthHelper
import com.google.firebase.messaging.FirebaseMessaging

class LoginActivity : AppCompatActivity() {

    private var isPasswordVisible = false

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login_view)

        val emailEditText = findViewById<EditText>(R.id.emailLogin)
        val passwordEditText = findViewById<EditText>(R.id.passwordLogin)
        val loginButton = findViewById<Button>(R.id.loginButton)

        emailEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val drawable = ContextCompat.getDrawable(this@LoginActivity, R.drawable.done_icon)
                val colorRes = if (s.isNullOrBlank()) R.color.gray else R.color.green
                val color = ContextCompat.getColor(this@LoginActivity, colorRes)

                drawable?.setTint(color)
                emailEditText.setCompoundDrawablesWithIntrinsicBounds(null, null, drawable, null)
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        passwordEditText.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_UP) {
                val drawableEnd = 2
                val drawable = passwordEditText.compoundDrawables[drawableEnd]
                if (drawable != null) {
                    val bounds = drawable.bounds
                    val touchX = event.rawX.toInt()
                    val rightEdge = passwordEditText.right
                    val iconStart = rightEdge - bounds.width() - passwordEditText.paddingEnd

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

        loginButton.setOnClickListener {
            val username = emailEditText.text.toString()
            val password = passwordEditText.text.toString()

            if (username.isNotEmpty() && password.isNotEmpty()) {
                FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val token = task.result
                        AuthHelper.loginUser(this, username, password, token)
                    } else {
                        Toast.makeText(this, "Failed to get Firebase token", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                Toast.makeText(this, "Please enter credentials", Toast.LENGTH_SHORT).show()
            }
        }

    }
}
