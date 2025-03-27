package com.example.apzandroid.utils

import android.content.Context
import androidx.appcompat.app.AppCompatActivity

object CsrfTokenManager {

    fun saveCsrfToken(context: Context, token: String) {
        val sharedPreferences = context.getSharedPreferences("CookiePrefs", AppCompatActivity.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString("csrf_token", token)
        editor.apply()
    }

    fun getCsrfToken(context: Context): String? {
        val sharedPreferences = context.getSharedPreferences("CookiePrefs", AppCompatActivity.MODE_PRIVATE)
        return sharedPreferences.getString("csrf_token", null)
    }

    fun clearCsrfToken(context: Context) {
        val sharedPreferences = context.getSharedPreferences("CookiePrefs", AppCompatActivity.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.remove("csrf_token")
        editor.apply()
    }
}
