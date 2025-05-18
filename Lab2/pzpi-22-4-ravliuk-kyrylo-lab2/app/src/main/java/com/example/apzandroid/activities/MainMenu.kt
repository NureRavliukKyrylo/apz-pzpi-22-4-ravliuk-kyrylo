package com.example.apzandroid.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.apzandroid.R
import com.example.apzandroid.fragments.MainMenuFragment


class MainMenu: AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_app)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, MainMenuFragment())
            .commit()

    }
}