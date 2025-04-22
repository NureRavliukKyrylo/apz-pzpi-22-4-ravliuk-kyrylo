package com.example.apzandroid.activities

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.view.MotionEvent
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.apzandroid.R
import com.example.apzandroid.helpers.auth.AuthHelper
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging

class LoginActivity : AppCompatActivity() {

    private var isPasswordVisible = false
    private lateinit var googleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001
    private lateinit var firebaseAuth: FirebaseAuth

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login_view)

        firebaseAuth = FirebaseAuth.getInstance()

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()

        googleSignInClient = GoogleSignIn.getClient(this, gso)

        val emailEditText = findViewById<EditText>(R.id.emailLogin)
        val passwordEditText = findViewById<EditText>(R.id.passwordLogin)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val googleSignInButton = findViewById<ImageView>(R.id.googleSignInButton)

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

        googleSignInButton.setOnClickListener {
            googleSignInClient.signOut().addOnCompleteListener {
                val signInIntent = googleSignInClient.signInIntent
                startActivityForResult(signInIntent, RC_SIGN_IN)
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                account?.let {
                    AuthHelper.firebaseAuthWithGoogle(this, account)
                }
            } catch (e: ApiException) {
                Toast.makeText(this, "Google sign in failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
